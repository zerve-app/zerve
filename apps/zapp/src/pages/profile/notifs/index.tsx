// import { type GetServerSidePropsContext } from 'next'
// import { getServerAuthSession } from '../../../server/common/get-server-auth-session'
import {
  ProfileNotifsFeature,
  type ProfileNotifsFeatureProps,
} from 'app/features/profile/ProfileNotifsFeature'

export default ProfileNotifsFeature

// export async function getServerSideProps(ctx: GetServerSidePropsContext) {
//   // const session = await getServerAuthSession(ctx)
//   // const user = session?.user
//   // if (!user) {
//   //   return {
//   //     redirect: {
//   //       destination: '/',
//   //       permanent: false,
//   //     },
//   //   }
//   // }
//   return {
//     props: {} as ProfileNotifsFeatureProps,
//   }
// }
