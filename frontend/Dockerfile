# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run stage
FROM nginx:alpine
# Copy built assets from 'dist/zhulin-work-method'
# Note: Adjust the source path if your angular.json outputPath is different or if using application builder (dist/zhulin-work-method/browser)
COPY --from=build /app/dist/zhulin-work-method /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
