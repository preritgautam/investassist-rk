import { Service } from '../../bootstrap/service/Service';
import { Router, useRouter } from 'next/router';
import { Deal, DealDocument } from '../../types';

class RoutingService extends Service {
  static userDashboardPage = '/user';
  static userDealsPage = '/user/deals';
  static userDealPage = (slug: string) => `/user/deals/${slug}/documents`;
  static userDealDetailsPage = (slug: string) => `/user/deals/${slug}/deal`;
  static userDealDocumentPage = (slug: string, documentId: string) => `/user/deals/${slug}/documents/${documentId}`;
  static userDealDocumentsPage = (slug: string) => `/user/deals/${slug}/documents`;
  static userDealPageBaseUrl = (slug: string) => `/user/deals/${slug}`;
  static userAssumptionsPage = '/user/assumptions';
  static userCompsPage = '/user/comps';
  static userCompsComparePage = '/user/comps/compare';
  static userNewAssumptionPage = '/user/assumptions/new';
  static companyNewAssumptionPage = '/user/account/assumptions/new';
  static editUserAssumptionPage = (assumptionId) => `/user/assumptions/${assumptionId}/edit`;
  static viewAccountAssumptionPage = (assumptionId) => `/user/assumptions/account/${assumptionId}`;
  static userSettingsPage = '/user/assumptions';
  static userTermsPage = '/user/assumptions';

  static plansPage = '/admin/plan';


  static useService(): RoutingService {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    return this.getService(router);
  }

  constructor(private readonly router: Router) {
    super();
  }

  gotoUrl(url) {
    return this.router.push(url);
  }

  goto(
    {
      url,
      as,
      replace = false,
      shallow = false,
    }: { url: string, as?: string, replace?: boolean, shallow?: boolean },
  ) {
    if (replace) {
      return this.router.replace(url, as, { shallow });
    } else {
      return this.router.push(url, as, { shallow });
    }
  }

  async gotoUserHomePage({ replace = false }: { replace?: boolean } = {}) {
    return this.goto({ url: '/user/deals', replace });
  }

  async gotoUserDealsPage({ replace = false } = {}) {
    return this.goto({ url: RoutingService.userDealsPage, replace });
  }

  async gotoDealDocumentPage(deal: Deal, document: DealDocument, replace = false) {
    return this.goto({ url: RoutingService.userDealDocumentPage(deal.slug, document.id), replace });
  }

  async gotoDealDocumentsPage(deal: Deal) {
    return this.goto({ url: RoutingService.userDealDocumentsPage(deal.slug) });
  }

  async gotoDealDetailsPage(deal: Deal) {
    return this.goto({ url: RoutingService.userDealDetailsPage(deal.slug) });
  }

  async gotoHomePage({ replace = false }) {
    return this.goto({ url: '/', replace });
  }

  async gotoAdminDashboard({ replace = false }: { replace?: boolean } = {}) {
    return this.goto({ url: '/_admin/dashboard', replace });
  }

  async gotoAdminLoginPage({ replace = false }: { replace?: boolean } = {}) {
    return this.goto({ url: '/_admin', replace });
  }

  async gotoAdminAccountsPage({ replace = false }: { replace?: boolean } = {}) {
    return this.goto({ url: '/_admin/accounts', replace });
  }

  gotoPlansPage = () => {
    return this.goto({ url: '/admin/plan' });
  };
  gotoAccountUsersListPage = () => {
    return this.goto({ url: '/admin/accountUsers' });
  };

  gotoAccountUserAcceptTermsPage = () => {
    return this.goto({ url: '/user/terms' });
  };

  async gotoUserDealPage(slug: string, tab?: number, replace: boolean = false, shallow: boolean = false) {
    return this.goto({
      url: `${RoutingService.userDealPage(slug)}`,
      replace,
      shallow,
    });
  }
}

export const useRoutingService: () => RoutingService = () => RoutingService.useService();

export { RoutingService };
