import { type GetServerSidePropsContext } from 'next'
import { getServerAuthSession } from '../../../server/common/get-server-auth-session'
import {
  ProfilePublicFeature,
  type ProfilePublicFeatureProps,
} from 'app/features/profile/ProfilePublicFeature'

export default ProfilePublicFeature

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
    props: {} as ProfilePublicFeatureProps,
  }
}
