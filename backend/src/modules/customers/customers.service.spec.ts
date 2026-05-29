import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import {
  CreateCustomerDto,
  UpdateKycStatusDto,
} from './dto/create-customer.dto';

const mockCustomer = (overrides = {}) => ({
  id: 'cust-1',
  branchId: 'branch-1',
  firstName: 'Sokha',
  lastName: 'Chhay',
  phone: '+855 12 345 678',
  email: 'sokha@example.com',
  nationalId: 'KH-123456789',
  dob: new Date('1990-01-15'),
  address: 'Phnom Penh, Cambodia',
  kycStatus: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockPrisma = () => ({
  customer: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  // ==========================================================
  // create
  // ==========================================================
  describe('create', () => {
    it('should create a customer with PENDING KYC status', async () => {
      const dto: CreateCustomerDto = {
        firstName: 'Sokha',
        lastName: 'Chhay',
        phone: '+855 12 345 678',
        branchId: 'branch-1',
      };

      const expected = mockCustomer({ kycStatus: 'PENDING' });
      prisma.customer.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result.kycStatus).toBe('PENDING');
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...dto,
          kycStatus: 'PENDING',
        }),
      });
    });

    it('should accept optional fields (email, nationalId, dob, address)', async () => {
      const dto: CreateCustomerDto = {
        firstName: 'Dara',
        lastName: 'Khmer',
        phone: '+855 99 888 777',
        email: 'dara@email.com',
        nationalId: 'KH-987654321',
        dob: new Date('1985-06-20'),
        address: 'Siem Reap',
        branchId: 'branch-2',
      };

      prisma.customer.create.mockResolvedValue(mockCustomer(dto));

      const result = await service.create(dto);

      expect(result.email).toBe('dara@email.com');
      expect(result.nationalId).toBe('KH-987654321');
    });
  });

  // ==========================================================
  // findAll
  // ==========================================================
  describe('findAll', () => {
    it('should return all customers with branch info', async () => {
      const customers = [
        mockCustomer({ id: 'cust-1' }),
        mockCustomer({ id: 'cust-2', firstName: 'Vanna' }),
      ];
      prisma.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        include: { branch: true },
      });
    });
  });

  // ==========================================================
  // findOne
  // ==========================================================
  describe('findOne', () => {
    it('should return a customer with their loans', async () => {
      const customer = { ...mockCustomer(), loans: [] };
      prisma.customer.findUnique.mockResolvedValue(customer);

      const result = await service.findOne('cust-1');

      expect(result.id).toBe('cust-1');
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'cust-1' },
        include: { loans: true },
      });
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Customer not found',
      );
    });
  });

  // ==========================================================
  // updateKyc
  // ==========================================================
  describe('updateKyc', () => {
    it('should update KYC status to APPROVED', async () => {
      const dto: UpdateKycStatusDto = { status: 'APPROVED' };
      const updated = mockCustomer({ kycStatus: 'APPROVED' });
      prisma.customer.update.mockResolvedValue(updated);

      const result = await service.updateKyc('cust-1', dto);

      expect(result.kycStatus).toBe('APPROVED');
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'cust-1' },
        data: { kycStatus: 'APPROVED' },
      });
    });

    it('should update KYC status to REJECTED', async () => {
      const dto: UpdateKycStatusDto = { status: 'REJECTED' };
      const updated = mockCustomer({ kycStatus: 'REJECTED' });
      prisma.customer.update.mockResolvedValue(updated);

      const result = await service.updateKyc('cust-1', dto);

      expect(result.kycStatus).toBe('REJECTED');
    });
  });
});
