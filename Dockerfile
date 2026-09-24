# =====================================================================
# LK-TECH (Linksmartech) — image de production
# Aucune dépendance à installer : l'application n'utilise que Node.js.
# Compatible : Render, Railway, Fly.io, Koyeb, VPS, Docker…
# =====================================================================
FROM node:20-alpine

# Dossier de travail
WORKDIR /app

# Le projet (aucun paquet externe : rien à installer)
COPY . .

# Dossier de données (contenu, messages, images téléversées).
# Sur Render / Railway, montez un disque persistant sur /app/data
# pour conserver les données entre les redéploiements.
RUN mkdir -p data/uploads && chown -R node:node /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
