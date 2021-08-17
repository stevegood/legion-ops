FROM golangci/golangci-lint:v1.27-alpine AS build
RUN apk add git
ENV CGO_ENABLED=0
RUN apk --no-cache add ca-certificates

WORKDIR /src
COPY go.* ./
RUN go mod download

COPY . ./
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

# FROM golang:1.15-alpine as server
# WORKDIR /src
# COPY go.* ./
# RUN go mod download

# COPY . ./
# RUN go test -v ./... \
#   && go build -v .

# FROM alpine

# ENV CLIENT_FILES_PATH /app/client/build

# RUN apk --no-cache add ca-certificates
# COPY --from=server /src/legion-ops /bin
# RUN apk update \
#   && apk upgrade \
#   && apk add --no-cache ca-certificates \
#   && update-ca-certificates 2>/dev/null || true
# EXPOSE 5000
# CMD ["/bin/legion-ops"]
