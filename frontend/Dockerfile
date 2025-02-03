# Build Stage
FROM node:18-alpine AS build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL $REACT_APP_API_URL
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]