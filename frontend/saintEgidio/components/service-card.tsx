import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ServiceCardProps {
  title: string
  description: string
  image: string
  href: string
}

export function ServiceCard({ title, description, image, href }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={href} className="w-full">
          <Button className="w-full bg-teal-500 hover:bg-teal-600">Выбрать</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

