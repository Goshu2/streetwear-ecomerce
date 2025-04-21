import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "About Us | GloGenesis",
    description: "Learn about GloGenesis, our mission, values, and the team behind our brand.",
}

export default function AboutPage() {
    return (
        <div className="container max-w-5xl py-12 px-4 md:px-6">
            <div className="space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">За GloGenesis</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Представяме ви най-новите тенденции с мисъл за качество и устойчивост.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Нашата история</h2>
                        <p className="text-muted-foreground mb-4">
                            DivineGlo е роден от страстта към градската мода и желанието да се правят висококачествени улични дрехи
                            достъпен за всеки. Това, което започна като малък бутик в центъра на града, се превърна в световна марка с
                            посветена общност.
                        </p>
                        <p className="text-muted-foreground">
                            Нашето пътуване започна, когато нашите основатели, запалени ентусиасти на streetwear, забелязаха празнина на пазара за
                            достъпна, но висококачествена градска мода. Те се заели да създадат марка, която не само да предлага
                            най-новите тенденции, но също така дават приоритет на устойчивостта и етичното производство.
                        </p>
                    </div>
                    <div className="relative h-[400px] rounded-lg overflow-hidden">
                        <Image
                            src="/CrownOfThrowns.jpg?height=800&width=600"
                            alt="DivineGlo store"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                <div className="bg-muted rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Нашите ценности</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-background p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-3">Качество</h3>
                            <p className="text-muted-foreground">
                            Ние никога не правим компромис с качеството. Всеки продукт е внимателно изработен с първокласни материали, за да се гарантира
                            издръжливост и комфорт.
                            </p>
                        </div>
                        <div className="bg-background p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-3">Устойчивост</h3>
                            <p className="text-muted-foreground">
                            Ние се ангажираме да намалим нашия отпечатък върху околната среда чрез устойчиви източници, екологични
                            опаковане и етични производствени процеси.
                            </p>
                        </div>
                        <div className="bg-background p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-3">Общност</h3>
                            <p className="text-muted-foreground">
                            Вярваме в изграждането на общност от съмишленици, които споделят нашата страст към уличното облекло и
                            градска култура.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
