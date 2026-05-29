import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  CreateCustomerDto,
  UpdateKycStatusDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const cleanedData = { ...createCustomerDto } as any;
    for (const key of Object.keys(cleanedData)) {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    }

    const { phone, email, nationalId } = cleanedData;

    // Check for existing phone
    const existingPhone = await this.prisma.customer.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new ConflictException(
        `Phone number ${phone} is already registered`,
      );
    }

    // Check for existing email if provided
    if (email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: { email },
      });
      if (existingEmail) {
        throw new ConflictException(`Email ${email} is already registered`);
      }
    }

    // Check for existing nationalId if provided
    if (nationalId) {
      const existingNationalId = await this.prisma.customer.findUnique({
        where: { nationalId },
      });
      if (existingNationalId) {
        throw new ConflictException(
          `National ID ${nationalId} is already registered`,
        );
      }
    }

    return this.prisma.customer.create({
      data: {
        ...cleanedData,
        kycStatus: 'PENDING',
      },
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: { branch: true },
    });
  }

  async search(query: string) {
    if (!query || !query.trim()) return this.findAll();

    const trimmedQuery = query.trim();

    // Split by spaces to support multi-word search (e.g. "Sokha Chan")
    const parts = trimmedQuery.split(/\s+/).filter(Boolean);

    // If multiple words, try to match them across firstName and lastName
    if (parts.length > 1) {
      return this.prisma.customer.findMany({
        where: {
          OR: [
            {
              AND: [
                { firstName: { contains: parts[0] } },
                { lastName: { contains: parts[1] } },
              ],
            },
            {
              AND: [
                { firstName: { contains: parts[1] } },
                { lastName: { contains: parts[0] } },
              ],
            },
            { firstName: { contains: trimmedQuery } },
            { lastName: { contains: trimmedQuery } },
            { khmerFirstName: { contains: trimmedQuery } },
            { khmerLastName: { contains: trimmedQuery } },
            { cid: { contains: trimmedQuery } },
            { email: { contains: trimmedQuery } },
            { phone: { contains: trimmedQuery } },
            { nationalId: { contains: trimmedQuery } },
            { passport: { contains: trimmedQuery } },
          ],
        },
        take: 10,
      });
    }

    return this.prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: trimmedQuery } },
          { lastName: { contains: trimmedQuery } },
          { khmerFirstName: { contains: trimmedQuery } },
          { khmerLastName: { contains: trimmedQuery } },
          { cid: { contains: trimmedQuery } },
          { email: { contains: trimmedQuery } },
          { phone: { contains: trimmedQuery } },
          { nationalId: { contains: trimmedQuery } },
          { passport: { contains: trimmedQuery } },
        ],
      },
      take: 10,
    });
  }

  async getNextCid() {
    const lastCustomer = await this.prisma.customer.findFirst({
      where: {
        cid: {
          startsWith: 'CID-',
        },
      },
      orderBy: {
        cid: 'desc',
      },
    });

    if (!lastCustomer || !lastCustomer.cid) {
      return { cid: 'CID-000001' };
    }

    const currentNumber = parseInt(lastCustomer.cid.replace('CID-', ''), 10);
    if (isNaN(currentNumber)) {
      return { cid: 'CID-000001' };
    }

    const nextNumber = currentNumber + 1;
    return { cid: `CID-${String(nextNumber).padStart(6, '0')}` };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { loans: true, documents: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const cleanedData = { ...updateCustomerDto } as any;
    for (const key of Object.keys(cleanedData)) {
      if (cleanedData[key] === '') {
        cleanedData[key] = null;
      }
    }

    const { phone, email, nationalId } = cleanedData;

    // Check for existing phone if changed
    if (phone) {
      const existingPhone = await this.prisma.customer.findFirst({
        where: { phone, id: { not: id } },
      });
      if (existingPhone) {
        throw new ConflictException(
          `Phone number ${phone} is already registered to another customer`,
        );
      }
    }

    // Check for existing email if changed
    if (email) {
      const existingEmail = await this.prisma.customer.findFirst({
        where: { email, id: { not: id } },
      });
      if (existingEmail) {
        throw new ConflictException(
          `Email ${email} is already registered to another customer`,
        );
      }
    }

    // Check for existing nationalId if changed
    if (nationalId) {
      const existingNationalId = await this.prisma.customer.findFirst({
        where: { nationalId, id: { not: id } },
      });
      if (existingNationalId) {
        throw new ConflictException(
          `National ID ${nationalId} is already registered to another customer`,
        );
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: cleanedData,
    });
  }

  async remove(id: string) {
    // Check if customer has loans
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { loans: true } } },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    if (customer._count.loans > 0) {
      throw new ConflictException(
        'Cannot delete customer with active or past loans',
      );
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async updateKyc(id: string, updateKycDto: UpdateKycStatusDto) {
    return this.prisma.customer.update({
      where: { id },
      data: { kycStatus: updateKycDto.status },
    });
  }

  /**
   * Backfill: find all PENDING-KYC customers who already have a
   * disbursed / active / completed loan and upgrade them to APPROVED.
   * Safe to call multiple times (idempotent).
   */
  async syncKycFromLoans(): Promise<{
    updated: number;
    customerIds: string[];
  }> {
    const APPROVED_LOAN_STATUSES = [
      'DISBURSED',
      'ACTIVE',
      'COMPLETED',
      'PENDING_DISBURSEMENT',
    ];

    // Find customers still PENDING whose loans are already post-approval
    const customers = await this.prisma.customer.findMany({
      where: {
        kycStatus: 'PENDING',
        loans: {
          some: { status: { in: APPROVED_LOAN_STATUSES } },
        },
      },
      select: { id: true },
    });

    if (customers.length === 0) {
      return { updated: 0, customerIds: [] };
    }

    const ids = customers.map((c) => c.id);

    await this.prisma.customer.updateMany({
      where: { id: { in: ids } },
      data: { kycStatus: 'APPROVED' },
    });

    return { updated: ids.length, customerIds: ids };
  }
}
