export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import VerifyClient from './VerifyClient'
type Props = { searchParams?: { token?: string } }

export default function VerifyPage({ searchParams = {} }: Props) {
  const token = searchParams.token ?? ''
  return <VerifyClient token={token} />
}
