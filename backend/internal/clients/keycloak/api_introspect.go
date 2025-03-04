package keycloakclient

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/go-resty/resty/v2"

	"github.com/Slava02/SaintDiego/internal/buildinfo"
)

type IntrospectTokenResult struct {
	Exp    int           `json:"exp"`
	Iat    int           `json:"iat"`
	Aud    SliceOrString `json:"aud"`
	Active bool          `json:"active"`
}

// IntrospectToken implements
// https://www.keycloak.org/docs/latest/authorization_services/index.html#obtaining-information-about-an-rpt
func (c *Client) IntrospectToken(ctx context.Context, token string) (*IntrospectTokenResult, error) {
	url := fmt.Sprintf("realms/%s/protocol/openid-connect/token/introspect", c.keyCloakRealm)

	var result IntrospectTokenResult

	resp, err := c.auth(ctx).
		SetHeader("Content-Type", "application/x-www-form-urlencoded").
		SetFormData(map[string]string{
			"token_type_hint": "requesting_party_token",
			"token":           token,
		}).
		SetResult(&result).
		Post(url)
	if err != nil {
		return nil, fmt.Errorf("send request to keycloak: %v", err)
	}

	if resp.StatusCode() != http.StatusOK {
		return nil, fmt.Errorf("errored keycloak response: %v", resp.Status())
	}

	return &result, nil
}

func (c *Client) auth(ctx context.Context) *resty.Request {
	authStr := base64.StdEncoding.EncodeToString([]byte(c.keyCloakClientID + ":" + c.keyCloakClientSecret))
	return c.cli.R().
		SetContext(ctx).
		SetAuthScheme("Basic").SetAuthToken(authStr).
		SetHeader("User-Agent", "booking-service/"+buildinfo.Version())
}

type SliceOrString []string

func (s *SliceOrString) UnmarshalJSON(data []byte) error {
	if data == nil {
		return errors.New("empty Aud")
	}

	// If it is an array type and has elements
	if len(data) > 2 && data[0] == '[' {
		return json.Unmarshal(data, (*[]string)(s))
	}

	// Removing double quotes and casting it to string
	var aud string
	err := json.Unmarshal(data, &aud)
	if err != nil {
		return fmt.Errorf("can't unmarshall aud: %v", err)
	}

	*s = []string{aud}

	return nil
}
