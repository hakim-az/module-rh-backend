import { Injectable, Inject } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";
import { UserRepository } from "@domain/repositories/user.repository";
import { Contrat } from "@domain/entities/contrat.entity";
import { UploadSignedContractDto } from "@application/dtos/contrat.dto";

@Injectable()
export class UploadSignedContractUseCase {
  constructor(
    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: number,
    uploadSignedContractDto: UploadSignedContractDto
  ): Promise<Contrat> {
    // Find the user's contract
    const contracts = await this.contratRepository.findByUserId(userId);
    if (!contracts || contracts.length === 0) {
      throw new Error("No contract found for this user");
    }

    // Get the most recent contract (assuming there's only one active contract per user)
    const contract = contracts[0];

    // Update the contract with the signed PDF
    const updatedContract = await this.contratRepository.update(contract.id, {
      fichierContratSignerPdf: uploadSignedContractDto.fichierContratSignerPdf,
    });

    // Update user status to 'contract-signed' after successful upload
    await this.userRepository.update(userId, {
      statut: "contract-signed",
    });

    return updatedContract;
  }
}
