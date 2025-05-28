import type { Metadata } from "next"
import { Truck, Package, Clock, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Политика за доставка | DivineGlo",
  description: "Информация за методите на доставка на DivineGlo, времето за доставка и продецурите за връщане",
}

export default function ShippingPolicyPage() {
  return (
     <div className="container max-w-4xl py-12 px-4 md:px-6">
      <div className="space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Политика за доставка</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Всичко, което трябва да знаете за нашите методи за доставка, срокове за доставка и процедури за връщане.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Truck className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Безплатна доставка</h2>
            <p className="text-muted-foreground">
              Безплатна стандартна доставка за всички поръчки над 100 лв. в рамките на България.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Package className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Международна доставка</h2>
            <p className="text-muted-foreground">
              Изпращаме до над 50 страни по света с конкурентни цени, изчислени при плащане.
            </p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <Clock className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Време за обработка</h2>
            <p className="text-muted-foreground">Поръчките се обработват в рамките на 1-2 работни дни преди изпращане.</p>
          </div>
          <div className="bg-muted rounded-xl p-6 flex flex-col items-center text-center">
            <RefreshCw className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Лесно връщане на продукти</h2>
            <p className="text-muted-foreground">Безпроблемно връщане в рамките на 30 дни след доставката.</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Методи за доставка и срокове</h2>

          <h3>Вътрешна доставка (САЩ)</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">Метод на доставка</th>
                <th className="border p-2 text-left">Очаквано време за доставка</th>
                <th className="border p-2 text-left">Цена</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Стандартна доставка</td>
                <td className="border p-2">3–5 работни дни</td>
                <td className="border p-2">$5.99 (Безплатно за поръчки над $75)</td>
              </tr>
              <tr>
                <td className="border p-2">Експресна доставка</td>
                <td className="border p-2">2–3 работни дни</td>
                <td className="border p-2">$12.99</td>
              </tr>
              <tr>
                <td className="border p-2">Доставка на следващия ден</td>
                <td className="border p-2">1 работен ден</td>
                <td className="border p-2">$24.99</td>
              </tr>
            </tbody>
          </table>

          <h3>Международна доставка</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">Регион</th>
                <th className="border p-2 text-left">Очаквано време за доставка</th>
                <th className="border p-2 text-left">Цена</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Канада</td>
                <td className="border p-2">5–10 работни дни</td>
                <td className="border p-2">От $14.99</td>
              </tr>
              <tr>
                <td className="border p-2">Европа</td>
                <td className="border p-2">7–14 работни дни</td>
                <td className="border p-2">От $19.99</td>
              </tr>
              <tr>
                <td className="border p-2">Азия и Тихоокеански регион</td>
                <td className="border p-2">10–20 работни дни</td>
                <td className="border p-2">От $24.99</td>
              </tr>
              <tr>
                <td className="border p-2">Останал свят</td>
                <td className="border p-2">14–30 работни дни</td>
                <td className="border p-2">От $29.99</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Забележка:</strong> Международните клиенти могат да бъдат подложени на митнически такси, вносни мита и данъци, които са за сметка на получателя.
          </p>

          <h2>Проследяване на поръчки</h2>
          <p>
            След изпращане на вашата поръчка ще получите имейл с потвърждение за доставка и номер за проследяване. Можете да проследите поръчката си чрез:
          </p>
          <ul>
            <li>Кликване върху линка за проследяване в имейла за потвърждение</li>
            <li>Влизане в акаунта ви и преглед на историята на поръчките</li>
            <li>Свързване с екипа ни за обслужване на клиенти</li>
          </ul>

          <h2>Ограничения при доставка</h2>
          <p>
            В момента не доставяме до пощенски кутии, APO/FPO адреси или някои отдалечени райони. Моля, свържете се с обслужване на клиенти при въпроси относно вашето местоположение.
          </p>

          <h2>Загубени или повредени пратки</h2>
          <p>
            Ако вашата пратка е загубена или повредена по време на транспортиране, моля свържете се с нас в рамките на 7 дни от очакваната дата на доставка. Ще работим със спедитора за разрешаване на проблема и гарантиране, че ще получите поръчката си.
          </p>

          <h2>Разходи за връщане</h2>
          <p>
            За информация относно връщането на артикули, моля вижте нашата{" "}
            <a href="/returns" className="text-primary hover:underline">
              Политика за връщане
            </a>
            . Общо:
          </p>
          <ul>
              <li>Първоначалните разходи за доставка не се възстановяват</li>
          </ul>

          <h2>Свържете се с нас</h2>
          <p>Ако имате въпроси относно нашата политика за доставка, моля свържете се с екипа ни за обслужване на клиенти:</p>
          <p>
            Имейл: shipping@DivineGlo.com
            <br />
            Телефон: +1 (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  )
}
