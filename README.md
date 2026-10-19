# inglêsAPP

App (PWA) para seguir a rotina diária de inglês: marcar as 5 etapas do dia, ver os dias seguidos, a fase atual e um calendário dos 6 meses do plano.

## Como usar no celular

1. Abra o link do app no Chrome (Android) ou no Safari (iPhone).
2. Instale na tela inicial: no Chrome, menu **⋮ → Instalar app**; no Safari, **Compartilhar → Adicionar à Tela de Início**.
3. Abra pelo ícone e, na parte "Lembrete diário", escolha o horário e toque em **Ativar lembrete**.

## Sobre os lembretes

O app não tem servidor, então o lembrete usa a sincronização periódica do navegador. Ela funciona no Chrome para Android com o app instalado, e o próprio sistema decide quando acordar o app, então o aviso pode chegar um pouco depois do horário. No iPhone o aviso só aparece dentro do app. Para garantir o horário exato, use também um alarme do celular.

## Dados

O progresso fica salvo no próprio aparelho (localStorage). Use **Copiar backup** e **Restaurar backup** para levar para outro celular.

## Rodar no computador

```
python -m http.server 8000
```

Depois abra http://localhost:8000.

## Publicar no GitHub Pages

Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`. O app fica em `https://eliezerpassos.github.io/MyEnglish/`.
