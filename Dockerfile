# ──────────────── Stage 1: Build Angular App ────────────────
FROM node AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else and build
COPY . .
RUN npm run build

# ──────────────── Stage 2: Serve with Nginx ────────────────
FROM nginx

ENV KISTLBOARD_API_URL="http://localhost:3000"

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config (optional)
# If you want to add gzip, history-API fallback, etc.,
# create a file `nginx.conf` in your project root.
# Uncomment the next two lines to use it.
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Copy built Angular files from Stage 1
COPY --from=build /usr/src/app/dist/web/browser /usr/share/nginx/html
COPY entrypoint.sh .

# Expose port 80 and start nginx
EXPOSE 80
ENTRYPOINT [ "./entrypoint.sh" ]
