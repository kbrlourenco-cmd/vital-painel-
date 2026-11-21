# Comanda Aí — versão de teste 0.1

App de comandas para bares que servem só bebidas (cerveja, destilados, energéticos, refrigerantes, sucos, águas) e **narguilé**, com baixa automática de insumos (ex.: 1 narguilé = 3 carvões + 1 essência).

## O que já faz
- **Comandas** por mesa (grade numérica) ou por nome do cliente.
- **Lançar consumo** com um toque por produto, +/− por item e indicador de estoque.
- **Fechar conta**: taxa de serviço opcional, divisão por pessoas e forma de pagamento (crédito/débito/pix/dinheiro). Depois de passar na maquininha, toque em “Cobrado na maquininha ✓”.
- **Caixa do dia**: faturamento, ticket médio, total por forma de pagamento, mais vendidos, lista de contas com hora de abertura e fechamento, exportação em CSV.
  - *Virada do dia* (padrão 6h): o que é vendido de madrugada conta no caixa da noite anterior.
- **Estoque**: baixa automática no fechamento, alerta de mínimo, entrada rápida (+6/+12/+24), produtos que consomem insumos.
- **Funciona offline** (PWA). Os dados ficam no aparelho e são enviados à planilha quando houver internet.
- **Google Planilhas (opcional)**: o dono edita preços e estoque na planilha. As vendas, os itens e as movimentações de estoque chegam lá automaticamente. Veja `apps-script/Code.gs`.

## Testar agora
Abra `index.html` em um servidor estático (ex.: `python3 -m http.server`) ou publique em hospedagem gratuita:

| Opção | Custo | Observação |
|---|---|---|
| **GitHub Pages** | grátis | Settings → Pages → branch e pasta. Ideal para o teste. |
| **Cloudflare Pages** | grátis | Banda ilimitada e domínio próprio fácil. |
| **Netlify / Vercel** | grátis | Basta arrastar a pasta. |
| **Google Apps Script** (back-end) | grátis | Cotas sobram para um bar. |

No iPhone: Safari → Compartilhar → “Adicionar à Tela de Início”. No Android: Chrome → “Instalar app”.

## Limitações conhecidas (v0.1)
- Os dados ficam no aparelho. Com **vários celulares**, cada um tem as próprias comandas abertas, e só as vendas fechadas se juntam na planilha. Comandas compartilhadas em tempo real ficam para a v0.2 (Firebase ou Supabase, que também têm plano gratuito).
- Não há login nem perfis (garçom × dono).
- Não emite cupom fiscal (NFC-e).
