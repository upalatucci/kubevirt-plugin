export type RHELAutomaticSubscriptionData = {
  activationKey: string;
  customUrl: string;
  organizationID: string;
  type: string;
};

export type RHELAutomaticSubscriptionFormProps = {
  canEdit: boolean;
  loaded: boolean;
  loadError: Error;
  subscriptionData: RHELAutomaticSubscriptionData;
  updateSubscription: (data: Partial<RHELAutomaticSubscriptionData>) => void;
};
