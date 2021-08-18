FROM node:alpine as web
WORKDIR /web
COPY web/ ./
RUN yarn && yarn build

FROM golangci/golangci-lint:latest-alpine AS build
RUN apk add git
ENV CGO_ENABLED=0
RUN apk --no-cache add ca-certificates

WORKDIR /src
COPY go.* ./
RUN go mod download

COPY . ./
COPY --from=web /web/build/ /src/web/build/
RUN golangci-lint run --timeout 10m0s ./... \
  && go test -v ./... \
  && go build -o /out/graphql .

FROM scratch
# copy the ca-certificate.crt from the build stage
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /out/graphql /

EXPOSE 5000
STOPSIGNAL SIGINT

ENTRYPOINT [ "/graphql" ]
