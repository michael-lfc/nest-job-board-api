import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        ...dto,
        companyId: userId,
      },
    });

    return {
      message: 'Job created successfully',
      data: job,
    };
  }

  async findAll(filters: FilterJobDto) {
    const { title, location, type, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      message: 'Jobs retrieved successfully',
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    return {
      message: 'Job retrieved successfully',
      data: job,
    };
  }

  async update(userId: number, id: number, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    if (job.companyId !== userId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: dto,
    });

    return {
      message: 'Job updated successfully',
      data: updated,
    };
  }

  async remove(userId: number, id: number) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    if (job.companyId !== userId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return {
      message: 'Job deleted successfully',
    };
  }
}