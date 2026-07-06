import { CustomerInfo, UserInfo } from "src/objects";
import { expect, Page } from "playwright/test";
import { MemberPage } from "../..";
import { WelcomeModal } from "../../shared-pages/welome.modal";

export class OnboardingMemberPortalFlow {
  private page: Page;
  private memberPage: MemberPage;

  constructor(page: Page) {
    this.page = page;
    this.memberPage = new MemberPage(this.page);
  }

  public signUp = async (customerInfo: CustomerInfo, hrSystem = "Does not apply", url?: string) => {
    const targetUrl = url ?? process.env.MEMBER_PORTAL_BASEURL! + "auth/login";

    await expect(async () => {
      await this.page.goto(targetUrl, { waitUntil: "load" });

      expect(this.page.url()).toBe(targetUrl);
    }).toPass();

    await this.memberPage.fillFormToSignUp(customerInfo, hrSystem);
  };

  public fillDuplicatedEmailToSignUp = async (customerInfo: CustomerInfo) => {
    await this.page.goto(process.env.MEMBER_PORTAL_BASEURL!);

    await this.page.waitForLoadState("domcontentloaded");

    await this.memberPage.fillInputOfTheFirstModalToSignUp(customerInfo);
  };

  public veriryFillingFormIsRequired = async (customerInfo: CustomerInfo) => {
    await this.page.goto(process.env.MEMBER_PORTAL_BASEURL!);

    await this.page.waitForLoadState("domcontentloaded");

    await this.memberPage.veriryFillingFormIsRequired(customerInfo);
  };

  public inviteMemberInOrganizationTabMemberPortal = async (invitedMembers: UserInfo[]) => {
    await new WelcomeModal(this.page).closeModalWithOption("readyDiveIn");
    await this.memberPage.moveToManageYourTeamModal();
    await this.memberPage.fillFormToInviteCustomerMembers(invitedMembers);
  };
}
