# Guia rápido de publicação — GBR Racing Lab 5.5.10C

1. No Cloudflare, abra **Workers & Pages → gbr-racing-lab**.
2. Prefira **Create deployment** em prévia, confirme o GP dos Estados Unidos no iPhone.
3. Verifique **Pistas → Eventos de GP → GP dos Estados Unidos → 03 / Cartas em destaque**: as cinco miniaturas devem aparecer.
4. Confirme que **Nightmare Fuel** continua funcionando, que os bônus +10% não mudaram e que favoritos/garagem carregam normalmente.
5. Publique o **mesmo ZIP** no ambiente Production, branch `main`.
6. Aguarde status **Success**. Abra em aba privada no Safari se a PWA ainda apresentar cache antigo.

### Rollback
Reimplante o ZIP anterior 5.5.10B ou acione Rollback para o deployment anterior no Cloudflare Pages. A alteração é de frontend/assets e não requer migração de banco.

### Nota de manutenção
O renderizador busca a imagem do jogador, e, se ela falhar ou não existir, a arte local com o nome `assets/events/featured/<id-evento>-<slug-carta>.webp`. Quando nenhuma imagem está disponível, o ícone genérico permanece. Para novos eventos, basta manter a Biblioteca Visual atualizada; artes extraídas dos banners podem ser incluídas sem alterar o código de renderização.
