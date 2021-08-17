#All the things
all: clean build

build:
	go build .

build-web:
	cd web && yarn build && cd ..

clean:
	rm -f internal/gql/generated.go \
		  internal/gql/models/generated.go

start:
	go run .

test:
	go test -v ./...

generate:
	go get github.com/99designs/gqlgen/cmd
	go run -v github.com/99designs/gqlgen $1