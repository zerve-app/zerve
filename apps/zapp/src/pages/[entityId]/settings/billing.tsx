import { EntitySettingsBillingFeature } from 'app/features/entity/settings/EntitySettingsBillingFeature'
import { PLANS } from 'src/utils/billing'

export default EntitySettingsBillingFeature

export async function getServerSideProps() {
  return {
    props: {
      plans: PLANS,
    },
  }
}
