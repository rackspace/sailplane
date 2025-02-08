import { CompanyRepository } from "./company-repository";
import { Injectable, Injector } from "@sailplane/injector";

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepo: CompanyRepository) {}

  listCompanies(): Promise<any[]> {
    return this.companyRepo.fetchAllCompanies();
  }
}
