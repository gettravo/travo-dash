import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ServiceDetailRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/api/${slug}`)
}
