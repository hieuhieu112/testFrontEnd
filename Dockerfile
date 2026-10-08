FROM node:22-alpine
WORKDIR /app
COPY dist ./dist
COPY scripts ./scripts
ENV PORT=80
EXPOSE 80
CMD ["node", "scripts/serve.mjs"]
