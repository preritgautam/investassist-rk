import React from 'react';
import { getAccountUserLayout } from '../../src/app/components/app/layouts/AccountUserLayout2';
import { userSession } from '../../src/userSession';
import { ManageAccountPlans } from '../../src/app/components/app/account/ManageAccountPlans';

const PlanPage = function() {
  const { user } = userSession.useAuthManager();
  const isRootUser = user.isRootUser;

  if (!isRootUser) {
    return (
      <div>
        Oops! It seems you are at wrong place. You don&apos;t have access to this area of the application.
      </div>
    );
  }

  return (
    <ManageAccountPlans/>
  );
};

PlanPage.getLayout = getAccountUserLayout;
export default PlanPage;
