# Tracking Ecosystem 🧭

O **Trekking Ecosystem** é um ecossistema completo para gestão, rastreamento e engajamento em eventos de Trekking e os eventos  padrão. O sistema é dividido em **3 projetos principais**: um Bankend, um Dashboard Web para gestão, e dois aplicativos Mobile (um para os participantes e outro para a equipe organizadora/Staff).

---

## 🏗️ Estrutura dos Projetos

### 1. Backend (`/backend`)
A base de todo o sistema. É uma API REST que centraliza as regras de negócio, cálculos de tempo, autenticação, etc.
- **Tecnologia**: Node.js com [NestJS](https://nestjs.com/)
- **Banco de Dados**: **PostgreSQL** (Gerenciado através do ORM [Prisma](https://www.prisma.io/)).
- **Como rodar**:
  ```bash
  cd backend
  npm install
  # Certifique-se de configurar a URL do banco PostgreSQL (ou utilizar supabase) no arquivo .env
  npx prisma generate
  npx prisma migrate dev
  npm run start:dev
  ```

### 2. Dashboard (`/dashboard`)
Painel Administrativo, painel de eventos do trekking e eventos normais Web utilizado pelos organizadores do evento para criar os trekkings, gerenciar equipes, aprovar pagamentos, emitir certificados e configurar as regras do evento (como Atividades Extras e Tempos Ideais).
- **Tecnologia**: [Next.js](https://nextjs.org/) (React) + TailwindCSS
- **Como rodar**:
  ```bash
  cd dashboard
  npm install
  npm run dev
  ```
- *Nota: Roda por padrão em `http://localhost:3000`.*

### 3. App Mobile - Competidores (`/appmobile`)
Aplicativo focado na experiência do usuário final (participante do evento). Através dele, os competidores podem visualizar eventos disponíveis, se inscrever, formar equipes, ver manuais, e receber seus certificados.
- **Tecnologia**: React Native com [Expo](https://expo.dev/) (usando Expo Router)
- **Como rodar**:
  ```bash
  cd appmobile
  npm install
  npm run start
  ```
- *Nota: Após rodar o comando, use o aplicativo **Expo Go** no seu celular para ler o QR Code, ou aperte `a` para rodar num emulador Android.*

### 4. App Staff - Organizadores e PC's (`/appstaff`)
Aplicativo focado exclusivamente para a equipe de apoio (Staff) e Postos de Controle (PC). Ele foi desenhado para **funcionar **Offline-First**, ou seja, ele permite que os fiscais que estão no meio do mato façam a leitura de QR Codes das equipes (check-in), registrem atividades extras e tempos ideais sem internet, sincronizando tudo com o backend quando a conexão retornar.
- **Tecnologia**: React Native com [Expo](https://expo.dev/) + AsyncStorage local.
- **Como rodar**:
  ```bash
  cd appstaff
  npm install
  npm run start
  ```

---

## 🗄️ Banco de Dados Recomendado
Todo o sistema foi modelado usando o **PostgreSQL**. Você precisará de uma instância do PostgreSQL rodando localmente (via Docker, PGAdmin, etc) ou usar um banco na nuvem (como Supabase, Neon, AWS RDS, etc). 

A string de conexão deve ser configurada no arquivo `.env` dentro da pasta `/backend`, no seguinte formato:
```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
```

---

## 🚀 Como iniciar o ambiente de desenvolvimento completo

Para testar o sistema completo na sua rede local (para que os apps celulares consigam se conectar ao seu computador), certifique-se de que:
1. O backend está rodando (`npm run start:dev`).
2. A variável de ambiente (BASE_URL / API_URL) configurada nos APPs mobile do Expo aponte para o **IP Local da sua máquina** (ex: `http://192.168.0.x:3333`) em vez de `localhost`.
3. Inicie o Dashboard e os Apps usando os comandos descritos acima.
