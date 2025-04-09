package timeSlots

import (
	"context"
	"testing"
	"time"

	"github.com/Slava02/SaintDiego/backend/schedule/internal/models"
	"github.com/Slava02/SaintDiego/backend/schedule/internal/usecases/timeSlots/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestUpdateTimeSlot(t *testing.T) {
	ctx := context.Background()
	mockRepo := new(mocks.ITimeSlotsRepository)
	mockTransactor := mocks.NewTransactor(t)

	useCase, err := New(Options{
		TimeSlotsRepository: mockRepo,
		Transactor:          mockTransactor,
	})
	assert.NoError(t, err)

	// Тестовые данные
	existingTimeSlot := &models.TimeSlot{
		ID:         1,
		Title:      "Test TimeSlot",
		Type:       "single",
		LocationID: 1,
		Capacity:   10,
		StartDate:  time.Now(),
		EndDate:    time.Now().Add(time.Hour),
		Status:     "active",
		Services: []*models.TimeSlotService{
			{
				ID:            1,
				ServiceTypeID: 1,
				Capacity:      5,
				BookingWindow: 30,
				Time:          time.Now(),
			},
		},
	}

	t.Run("add new service to timeSlot", func(t *testing.T) {
		mockRepo.ExpectedCalls = nil
		mockTransactor.ExpectedCalls = nil

		// Подготовка
		newTimeSlot := *existingTimeSlot
		newService := &models.TimeSlotService{
			ServiceTypeID: 2,
			Capacity:      3,
			BookingWindow: 30,
			Time:          time.Now(),
		}
		newTimeSlot.Services = append(newTimeSlot.Services, newService)

		// Создаем обновленный timeSlot с новым сервисом
		updatedTimeSlot := newTimeSlot
		updatedTimeSlot.Services = []*models.TimeSlotService{
			existingTimeSlot.Services[0],
			newService,
		}

		// Настройка моков
		mockRepo.On("GetTimeSlot", ctx, int64(1)).Return(existingTimeSlot, nil)
		mockRepo.On("CreateTimeSlotServices", ctx, int64(1), mock.Anything).Return([]*models.TimeSlotService{newService}, nil)
		mockRepo.On("GetEventsByServiceIds", ctx, mock.Anything).Return([]*models.Event{}, nil)
		mockRepo.On("InsertUpdateEvents", ctx, mock.Anything).Return(nil)
		mockRepo.On("InsertUpdateTimeSlot", ctx, &newTimeSlot).Return(&updatedTimeSlot, nil)
		mockTransactor.On("WithinTransaction", ctx, mock.Anything).Return(nil)

		// Выполнение
		result, err := useCase.UpdateTimeSlot(ctx, &newTimeSlot)

		// Проверка
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Len(t, result.Services, 2)
		assert.Equal(t, int64(1), result.Services[0].ID)
		assert.Equal(t, int64(2), result.Services[1].ServiceTypeID)
		mockRepo.AssertExpectations(t)
		mockTransactor.AssertExpectations(t)
	})

	t.Run("remove service from timeSlot", func(t *testing.T) {
		mockRepo.ExpectedCalls = nil
		mockTransactor.ExpectedCalls = nil

		// Подготовка
		newTimeSlot := *existingTimeSlot
		newTimeSlot.Services = []*models.TimeSlotService{}

		// Настройка моков
		mockRepo.On("GetTimeSlot", ctx, int64(1)).Return(existingTimeSlot, nil)
		mockRepo.On("DeleteTimeSlotServicesByIds", ctx, []int64{1}).Return(nil)
		mockRepo.On("DeleteEventsByServiceIds", ctx, []int64{1}).Return(nil)
		mockRepo.On("GetEventsByServiceIds", ctx, mock.Anything).Return([]*models.Event{}, nil)
		mockRepo.On("InsertUpdateEvents", ctx, mock.Anything).Return(nil)
		mockRepo.On("InsertUpdateTimeSlot", ctx, &newTimeSlot).Return(&newTimeSlot, nil)
		mockTransactor.On("WithinTransaction", ctx, mock.Anything).Return(nil)

		// Выполнение
		result, err := useCase.UpdateTimeSlot(ctx, &newTimeSlot)

		// Проверка
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Len(t, result.Services, 0)
		mockRepo.AssertExpectations(t)
		mockTransactor.AssertExpectations(t)
	})

	t.Run("change from single to recurring", func(t *testing.T) {
		mockRepo.ExpectedCalls = nil
		mockTransactor.ExpectedCalls = nil

		// Подготовка
		newTimeSlot := *existingTimeSlot
		newTimeSlot.Type = "recurring"
		newTimeSlot.Recurrence = &models.TimeSlotRecurrence{
			Frequency: "daily",
			EndType:   "date",
			EndValue:  time.Now().AddDate(0, 1, 0),
		}

		// Настройка моков
		mockRepo.On("GetTimeSlot", ctx, int64(1)).Return(existingTimeSlot, nil)
		mockRepo.On("DeleteEventsByServiceIds", ctx, []int64{1}).Return(nil)
		mockRepo.On("GetEventsByServiceIds", ctx, mock.Anything).Return([]*models.Event{}, nil)
		mockRepo.On("InsertUpdateEvents", ctx, mock.Anything).Return(nil)
		mockRepo.On("InsertUpdateTimeSlot", ctx, &newTimeSlot).Return(&newTimeSlot, nil)
		mockTransactor.On("WithinTransaction", ctx, mock.Anything).Return(nil)

		// Выполнение
		result, err := useCase.UpdateTimeSlot(ctx, &newTimeSlot)

		// Проверка
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "recurring", result.Type)
		assert.NotNil(t, result.Recurrence)
		mockRepo.AssertExpectations(t)
		mockTransactor.AssertExpectations(t)
	})

	t.Run("change from recurring to single", func(t *testing.T) {
		mockRepo.ExpectedCalls = nil
		mockTransactor.ExpectedCalls = nil

		// Подготовка
		recurringTimeSlot := *existingTimeSlot
		recurringTimeSlot.Type = "recurring"
		recurringTimeSlot.Recurrence = &models.TimeSlotRecurrence{
			Frequency: "daily",
			EndType:   "date",
			EndValue:  time.Now().AddDate(0, 1, 0),
		}

		newTimeSlot := recurringTimeSlot
		newTimeSlot.Type = "single"
		newTimeSlot.Recurrence = nil

		// Настройка моков
		mockRepo.On("GetTimeSlot", ctx, int64(1)).Return(&recurringTimeSlot, nil)
		mockRepo.On("DeleteTimeSlotRecurrence", ctx, int64(1)).Return(nil)
		mockRepo.On("DeleteEventsByServiceIds", ctx, []int64{1}).Return(nil)
		mockRepo.On("GetEventsByServiceIds", ctx, mock.Anything).Return([]*models.Event{}, nil)
		mockRepo.On("InsertUpdateEvents", ctx, mock.Anything).Return(nil)
		mockRepo.On("InsertUpdateTimeSlot", ctx, &newTimeSlot).Return(&newTimeSlot, nil)
		mockTransactor.On("WithinTransaction", ctx, mock.Anything).Return(nil)

		// Выполнение
		result, err := useCase.UpdateTimeSlot(ctx, &newTimeSlot)

		// Проверка
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "single", result.Type)
		assert.Nil(t, result.Recurrence)
		mockRepo.AssertExpectations(t)
		mockTransactor.AssertExpectations(t)
	})

	t.Run("update existing service", func(t *testing.T) {
		mockRepo.ExpectedCalls = nil
		mockTransactor.ExpectedCalls = nil

		// Подготовка
		newTimeSlot := *existingTimeSlot
		updatedService := *newTimeSlot.Services[0]
		updatedService.Capacity = 10
		newTimeSlot.Services = []*models.TimeSlotService{&updatedService}

		// Настройка моков
		mockRepo.On("GetTimeSlot", ctx, int64(1)).Return(existingTimeSlot, nil)
		mockRepo.On("GetEventsByServiceIds", ctx, mock.Anything).Return([]*models.Event{}, nil)
		mockRepo.On("InsertUpdateEvents", ctx, mock.Anything).Return(nil)
		mockRepo.On("InsertUpdateTimeSlot", ctx, &newTimeSlot).Return(&newTimeSlot, nil)
		mockTransactor.On("WithinTransaction", ctx, mock.Anything).Return(nil)

		// Выполнение
		result, err := useCase.UpdateTimeSlot(ctx, &newTimeSlot)

		// Проверка
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, int32(10), result.Services[0].Capacity)
		mockRepo.AssertExpectations(t)
		mockTransactor.AssertExpectations(t)
	})
}
