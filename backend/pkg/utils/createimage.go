package utils

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"

	"github.com/gofrs/uuid"
)

func CreateImagePath(dir, image string) (string, error) {

	regesp := regexp.MustCompile(`^data:image/([^;]+);base64,`)
	match := regesp.FindStringSubmatch(image)
	if len(match) != 2 {
		return "", errors.New("badImage")
	}
	base64Data := regesp.ReplaceAllString(image, "")
	decoded, err := base64.StdEncoding.DecodeString(base64Data)

	nameImage, err := uuid.NewV7()
	if err != nil {
		return "", err
	}

	newNameImage := nameImage.String() + ".png"
	ImagePath := filepath.Join(dir, newNameImage)
	outputFile, err := os.Create(ImagePath)
	if err != nil {
		return "", err
	}
	defer outputFile.Close()

	_, err = io.Copy(outputFile, bytes.NewReader([]byte(decoded)))
	if err != nil {
		fmt.Println("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", err)
		return "", err
	}

	return ImagePath, nil
}
