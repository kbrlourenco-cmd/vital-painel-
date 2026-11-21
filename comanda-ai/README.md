# Comanda Aí — versão de teste 0.3

App de caixa para bares que servem bebidas e **narguilé**. Roda em **um único aparelho** (o do caixa), funciona sem internet e **guarda tudo no próprio aparelho**. Não precisa de planilha.

## As 5 abas
| Aba | Para que serve |
|---|---|
| **Saídas** | Comandas por mesa ou nome. Lança as bebidas, edita preço por item, fecha a conta (10% opcional, desconto, divide, forma de pagamento). Cada conta fechada vira uma saída do dia, com data e hora. |
| **Entradas** | Registra o que entrou e quanto custou: produtos e insumos (bebidas, carvão, essência), que **somam no estoque**, ou outras despesas (gelo, gás, funcionário, aluguel…). |
| **Resumo** | Dia ou mês: **Saídas − Entradas = Resultado**, total por forma de pagamento, mais vendidos, descontos e dia a dia do mês. Exporta para Excel (CSV) se o contador pedir. |
| **Estoque** | Atualizado sozinho: as vendas tiram, as entradas somam. O narguilé tira 3 carvões e 1 essência. Alerta de mínimo. |
| **Ajustes** | Nº de mesas, % de serviço, virada do dia (padrão 6h), **backup e restauração**. |

## Onde os dados ficam
No armazenamento do navegador do próprio aparelho. O app pede ao sistema que não apague esses dados.
- **Instale na tela de início** (iPhone: Safari → Compartilhar → "Adicionar à Tela de Início"; Android: Chrome → "Instalar app"). No iPhone isso evita que o Safari limpe os dados.
- **Backup semanal**: Ajustes → "Fazer backup agora" abre o compartilhar do celular para mandar o arquivo por WhatsApp, e-mail ou Drive. Para recuperar: "Restaurar backup".

## Publicar (grátis)
GitHub Pages, Cloudflare Pages ou Netlify. É só publicar esta pasta.

## Limitações (v0.3)
- Um aparelho só. Sem backup, perder o aparelho é perder os dados.
- Não há login.
- Não emite cupom fiscal (NFC-e).
