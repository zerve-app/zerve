import { type GetServerSidePropsContext } from 'next'
import { getServerAuthSession } from '../../../server/common/get-server-auth-session'
import {
  ProfileAuthFeature,
  type ProfileAuthFeatureProps,
} from 'app/features/profile/ProfileAuthFeature'

export default ProfileAuthFeature

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx)
  const user = session?.user
  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: {} as ProfileAuthFeatureProps,
  }
}
