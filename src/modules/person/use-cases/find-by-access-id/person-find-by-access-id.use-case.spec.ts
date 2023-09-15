import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../db/prisma.service';
import { HttpException } from '@nestjs/common';
import { personModuleMock } from '../../person.module';
import { personMock } from 'src/domain/mocks';
import { PersonFindByAccessIdUseCase } from './person-find-by-access-id.use-case';

describe('PersonFindByAccessIdUseCase', () => {
  let usecase: PersonFindByAccessIdUseCase;
  let moduleRef: TestingModule;
  let prismaService: PrismaService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule(personModuleMock).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);
    usecase = moduleRef.get<PersonFindByAccessIdUseCase>(
      PersonFindByAccessIdUseCase,
    );
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });

  afterEach(async () => {
    prismaService.$disconnect();

    await moduleRef.close();
  });

  it('should findOne', async () => {
    const findOneSpy = jest
      .spyOn(prismaService.person, 'findFirst')
      .mockResolvedValue(personMock);

    const response = await usecase.execute('1');

    expect(response).toStrictEqual(personMock);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        accessId: '1',
        deletedAt: null,
      },
    });
  });

  it('Should throw an error when not found person', async () => {
    jest.spyOn(prismaService.person, 'findFirst').mockResolvedValue(null);

    const spyFind = jest.spyOn(usecase, 'execute');

    await expect(usecase.execute('1')).rejects.toThrow(HttpException);

    expect(spyFind).toHaveBeenCalledTimes(1);
  });
});
