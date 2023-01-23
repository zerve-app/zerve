import { PricingFeature } from 'app/features/home/PricingFeature'
import { PLANS } from 'src/utils/billing'

export default PricingFeature

export async function getServerSideProps() {
  return {
    props: {
      plans: PLANS,
    },
  }
}
