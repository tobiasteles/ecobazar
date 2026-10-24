<div align="center">

# 🌱 EcoBazar

**Bazar sustentável online: vitrine de itens doados, carrinho de reservas e painel para a equipe gerenciar o catálogo.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![Neon](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql&logoColor=white)](https://neon.tech)

[**🔗 Ver online**](https://ecobazar-drab.vercel.app/) · [Reportar um bug](../../issues)

<img src="https://i.imgur.com/3TSn4Hl.png" alt="Vitrine do EcoBazar" width="720" />

</div>

---

## ✨ O que é

Plataforma de comércio sustentável: itens usados (roupas, calçados, brinquedos, livros e acessórios) ganham nova vida em uma vitrine online. O cliente escolhe os itens, reserva e retira no bazar, e a equipe controla estoque e reservas por um painel.

## 🚀 Funcionalidades

**Para o cliente**
- Vitrine com **busca, filtro por categoria e ordenação**
- **Carrinho de reservas** com gaveta lateral
- Reserva com nome, e-mail e telefone, e o item some da vitrine ao ser reservado
- **Comprovante de reserva** pronto para imprimir
- Informações de data e local do bazar

**Para a equipe**
- Painel para **cadastrar, editar e remover itens**, com tamanho, categoria, preço e status
- **Upload de fotos** (UploadThing)
- Lista de reservas com os dados de quem reservou

## 🛠️ Stack

| Camada          | Tecnologias                                          |
| --------------- | ---------------------------------------------------- |
| Framework       | Next.js 16 (App Router) e React 19                   |
| Linguagem       | TypeScript                                           |
| Estilo e UI     | Tailwind CSS 4 e shadcn/ui                           |
| Dados no cliente| TanStack Query                                       |
| Banco de dados  | PostgreSQL no Neon com Drizzle ORM                   |
| Upload          | UploadThing                                          |
| Métricas        | Vercel Analytics                                     |

## 🗃️ Modelo de dados

- `products`: nome, descrição, preço, foto, categoria (`roupas`, `calcados`, `brinquedos`, `livros`, `acessorios`, `outros`), tamanho e status (`available` ou `reserved`)
- `reservations`: produto, dados do cliente e data da reserva

## 🧪 Rodando localmente

```bash
git clone https://github.com/tobiasteles/ecobazar.git
cd ecobazar
npm install

cp .env.example .env.local   # preencha as variáveis abaixo
npm run db:push              # cria as tabelas
npm run dev                  # http://localhost:3000
```

| Variável            | Descrição                    |
| ------------------- | ---------------------------- |
| `DATABASE_URL`      | Connection string do Neon    |
| `UPLOADTHING_TOKEN` | Token do UploadThing         |

## 📁 Estrutura

```
app/          # vitrine, painel admin e rotas de API (produtos, reservas, upload)
components/   # ProductCard, CartDrawer, CategoryFilter, comprovante e UI (shadcn)
contexts/     # estado do carrinho
db/           # schema Drizzle e conexão
```

## 👤 Autor

**Tobias Teles** · [Portfólio](https://tobiasteles.vercel.app) · [LinkedIn](https://www.linkedin.com/in/tobias-teles/)
