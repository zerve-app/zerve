import type { ProfileHomeFeatureProps } from 'app/features/profile/ProfileHomeFeature'
import { ProfileHomeFeature } from 'app/features/profile/ProfileHomeFeature'
import type { GetServerSidePropsContext } from 'next'
import { getServerAuthSession } from 'src/server/common/get-server-auth-session'

export default ProfileHomeFeature

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
    props: {} as ProfileHomeFeatureProps,
  }
}
