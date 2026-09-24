# =====================================================================
# LK-TECH (Linksmartech) — image de la version Node.js
# Aucune dépendance à installer : l'application n'utilise que Node.js.
# Compatible : Render, Railway, Fly.io, Koyeb, VPS, Docker…
# (La version PHP, à la racine du dépôt, n'a pas besoin de Docker : elle
#  s'installe en téléversant les fichiers sur un hébergement classique.)
# =====================================================================
FROM node:20-alpine

WORKDIR /app

# Le code de la version Node.js (dossier node/)
COPY node/ ./node/

# Dossier de données (contenu, messages, images téléversées).
# Sur Render / Railway, montez un disque persistant sur /app/node/data
# pour conserver les données entre les redéploiements.
RUN mkdir -p node/data/uploads && chown -R node:node /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "node/server.js"]
