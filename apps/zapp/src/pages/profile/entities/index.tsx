import type { GetServerSidePropsContext } from 'next'
import {
  ProfileEntitiesFeature,
  type ProfileEntitiesFeatureProps,
} from 'app/features/profile/ProfileEntitiesFeature'
import { getServerTrpc } from 'src/server/common/trpc'

export default ProfileEntitiesFeature

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { trpc, session } = await getServerTrpc(ctx)
  const user = session?.user
  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  const data = await trpc.entity.list()
  return {
    props: {
      data,
    } as ProfileEntitiesFeatureProps,
  }
}
