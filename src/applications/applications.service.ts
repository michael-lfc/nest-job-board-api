import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async apply(userId: number, jobId: number, cvUrl: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${jobId} not found`);
    }

    const existingApplication = await this.prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: userId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    const application = await this.prisma.application.create({
      data: {
        candidateId: userId,
        jobId,
        cvUrl,
      },
    });

    const candidate = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    await this.mail.sendApplicationConfirmation(
      candidate!.email,
      candidate!.name,
      job.title,
      job.company.name,
    );

    return {
      message: 'Application submitted successfully',
      data: application,
    };
  }

  async getJobApplications(userId: number, jobId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${jobId} not found`);
    }

    if (job.companyId !== userId) {
      throw new ForbiddenException('You can only view applications for your own jobs');
    }

    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Applications retrieved successfully',
      data: applications,
    };
  }

  async getMyApplications(userId: number) {
    const applications = await this.prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Applications retrieved successfully',
      data: applications,
    };
  }
}