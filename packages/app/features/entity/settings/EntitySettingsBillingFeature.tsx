import { Button, Heading, Spinner, Switch, XStack } from '@zerve/ui'
import { PageSectionStack } from 'app/components/PageSection'
import RootLayout from 'app/components/RootLayout'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import type { PlansConfig } from '../../../../../apps/zapp/src/utils/billing'
import { trpc } from '../../../../../apps/zapp/src/utils/trpc'
import type Stripe from 'stripe'
import { EntitySettingsContainer } from './EntitySettingsContainer'
import { CreditCard } from '@tamagui/lucide-icons'

function SubscribePage({ plans, entityKey }: { plans: PlansConfig; entityKey: string }) {
  const startBilling = trpc.billing.start.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location = url
    },
  })
  const [isYearly, setIsYearly] = useState<boolean>(false)
  return (
    <>
      {startBilling.isLoading && <Spinner />}
      <Heading>{isYearly ? 'Yearly' : 'Monthly'} Subscriptions</Heading>
      <Switch checked={isYearly} onCheckedChange={setIsYearly}>
        <Switch.Thumb animation="bouncy" />
      </Switch>
      {plans.map((plan) => (
        <Button
          key={plan.key}
          onPress={() => startBilling.mutate({ entityKey, planKey: plan.key, isYearly })}
        >
          Start {plan.key} ${isYearly ? plan.listedPriceYearly : plan.listedPriceMonthly} /{' '}
          {isYearly ? 'year' : 'month'}
        </Button>
      ))}
    </>
  )
}

function ManageSubscriptionPage({
  subscription,
  entityKey,
}: {
  subscription: any
  entityKey: string
}) {
  const manageBilling = trpc.billing.manage.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location = url
    },
  })

  return (
    <XStack>
      <Button
        onPress={() => {
          manageBilling.mutate(entityKey)
        }}
        icon={CreditCard}
      >
        {manageBilling.isLoading && <Spinner />}
        Manage Billing
      </Button>
    </XStack>
  )
}

function getDecimalsOfCurrency(currency: string) {
  switch (currency.toUpperCase()) {
    // https://stripe.com/docs/currencies
    case 'BIF':
      return 0
    case 'CLP':
      return 0
    case 'DJF':
      return 0
    case 'GNF':
      return 0
    case 'JPY':
      return 0
    case 'KMF':
      return 0
    case 'KRW':
      return 0
    case 'MGA':
      return 0
    case 'PYG':
      return 0
    case 'RWF':
      return 0
    case 'UGX':
      return 0
    case 'VND':
      return 0
    case 'VUV':
      return 0
    case 'XAF':
      return 0
    case 'XOF':
      return 0
    case 'XPF':
      return 0
    case 'BHD':
      return 3
    case 'JOD':
      return 3
    case 'KWD':
      return 3
    case 'OMR':
      return 3
    case 'TND':
      return 3
    default:
      return 2
  }
}

export function formatCurrency(amountDecimal: number, currency: string) {
  const decimals = getDecimalsOfCurrency(currency)
  const basis = 10 ** decimals
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    compactDisplay: 'short',
    maximumFractionDigits: amountDecimal % basis === 0 ? 0 : decimals,
  })
  // if (amountDecimal % basis === 0) {
  //   return `${amountDecimal / basis} ${currency.toUpperCase()}`
  // }
  return `${formatter.format(amountDecimal / basis)} ${currency.toUpperCase()}`
}

export function EntitySettingsBillingFeature({ plans }: { plans: PlansConfig }) {
  const { query } = useRouter()
  const session = useSession()
  const entityKey = String(query.entityId)
  const billingState = trpc.billing.state.useQuery(entityKey)

  // useManageBilling
  const plan = billingState.data?.plan
  const subscription = billingState.data?.subscription
  const stripePlan = subscription?.plan as Stripe.Plan | undefined
  console.log('d', billingState.data)
  return (
    <RootLayout>
      <EntitySettingsContainer active="billing">
        {billingState.data?.status && (
          <Heading>
            Subscription to {plan?.title}: {billingState.data?.status}
          </Heading>
        )}
        {stripePlan && (
          <Heading>
            {formatCurrency(stripePlan.amount_decimal, stripePlan.currency)} /{' '}
            {stripePlan.interval_count === 1
              ? stripePlan.interval
              : `${stripePlan.interval_count} ${stripePlan.interval}s`}
          </Heading>
        )}
        {plan && <Heading>Max Storage: {plan?.maxStorageGb} GB</Heading>}
        {plan && <Heading>Max Nodes: {plan?.maxNodes}</Heading>}
        {billingState.data?.billingUser ? (
          billingState.data?.billingUser.id === session.data?.user?.id ? (
            billingState.data?.subscription ? (
              <ManageSubscriptionPage
                subscription={billingState.data?.subscription}
                entityKey={entityKey}
              />
            ) : (
              <SubscribePage plans={plans} entityKey={entityKey} />
            )
          ) : (
            <Heading>Billing Owner: {billingState.data?.billingUser.name}</Heading>
          )
        ) : (
          <SubscribePage plans={plans} entityKey={entityKey} />
        )}
      </EntitySettingsContainer>
    </RootLayout>
  )
}
