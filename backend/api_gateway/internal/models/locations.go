package models

type Location struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type GetLocationsRequest struct {
	Locations []Location `json:"locations"`
}

type GetLocationsResponse struct {
	Locations []*Location `json:"locations"`
}

type CreateLocationRequest struct {
	Name    string `json:"name"`
	Address string `json:"address"`
}
