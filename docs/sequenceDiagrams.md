Visitor Registration Process

sequenceDiagram
    Volunteer->>Telegram Bot: Start new registration
    Telegram Bot->>Volunteer Gateway: Begin registration flow
    Volunteer Gateway->>Visitor Service: Check existing visitor
    Visitor Service->>MySQL: Search by phone/name
    alt Visitor exists
        Visitor Service->>Volunteer Gateway: Show visitor profile
    else New visitor
        Volunteer Gateway->>Telegram Bot: Request visitor details
        Volunteer->>Telegram Bot: Enter name/phone
        Telegram Bot->>Visitor Service: Create visitor
        Visitor Service->>MySQL: Save visitor
        Visitor Service->>Reporting Service: Track registration
    end
    Volunteer Gateway->>Event Service: Get available slots
    Event Service->>MySQL: Check capacity
    Event Service-->>Volunteer Gateway: Return slots
    Telegram Bot->>Volunteer: Show available slots
    Volunteer->>Telegram Bot: Select slot
    Telegram Bot->>Participant Service: Create booking
    Participant Service->>MySQL: Store booking
    Participant Service->>Notification Service: Send confirmation

Регистрация волонтера

sequenceDiagram
    Volunteer->>Telegram Bot: /start
    Telegram Bot->>Bot Gateway: Start registration
    Bot Gateway->>Volunteer Service: InitiateRegistration()
    Volunteer Service->>Telegram API: GetChatMembers()
    Telegram API-->>Volunteer Service: Member list
    alt Is member
        Volunteer Service->>MySQL: CreateVolunteer()
        Volunteer Service->>Redis: CacheSession()
        Volunteer Service->>Telegram Bot: SendWelcomeMessage()
    else Not member
        Volunteer Service->>Telegram Bot: SendAccessDenied()
    end


Запись существующего посетителя

sequenceDiagram
    Volunteer->>Bot Gateway: StartBooking()
    Bot Gateway->>Visitor Service: SearchVisitor()
    Visitor Service->>Redis: CheckCache()
    alt Cache hit
        Redis-->>Visitor Service: Visitor data
    else Cache miss
        Visitor Service->>MySQL: QueryVisitor()
    end
    Bot Gateway->>Event Service: GetAvailableSlots()
    Event Service->>Service Catalog: ValidateService()
    Event Service-->>Bot Gateway: Time slots
    Bot Gateway->>Participant Service: CreateBooking()
    Participant Service->>MySQL: CheckCapacity()
    Participant Service->>MySQL: CreateParticipant()
    Participant Service->>Notification Service: SendConfirmation()

Регистрация нового посетителя

sequenceDiagram
    Volunteer->>Bot Gateway: NewVisitor()
    Bot Gateway->>Visitor Service: CreateVisitor()
    Visitor Service->>MySQL: CheckDuplicates()
    Visitor Service->>MySQL: CreateVisitorRecord()
    Visitor Service->>Event Service: GetRegistrationEvents()
    Event Service-->>Bot Gateway: Events list
    Bot Gateway->>Participant Service: CreateRegistration()
    Participant Service->>MySQL: RestrictToRegistrationEvent()
    Participant Service->>MySQL: CreateParticipant()

Создание события администратором

sequenceDiagram
    AdminUI->>API Gateway: CreateEvent()
    API Gateway->>Event Service: InitCreation()
    Event Service->>Service Catalog: ValidateServices()
    Event Service->>MySQL: CheckLocationAvailability()
    Event Service->>MySQL: CreateEvent()
    Event Service->>Message Broker: PublishEventCreated()
    Message Broker->>Notification Service: SendNotifications()
    Message Broker->>Reporting Service: UpdateAnalytics()

Управление расписанием

sequenceDiagram
    AdminUI->>API Gateway: GetEvents()
    API Gateway->>Event Service: ListEvents()
    Event Service->>MySQL: QueryWithFilters()
    Event Service-->>AdminUI: DisplaySchedule()
    AdminUI->>Event Service: UpdateEvent()
    Event Service->>MySQL: CheckParticipants()
    Event Service->>MySQL: UpdateEvent()
    Event Service->>Participant Service: NotifyChanges()

Экспорт данных

sequenceDiagram
    AdminUI->>Reporting Service: GenerateReport()
    Reporting Service->>Event Service: GetEventData()
    Reporting Service->>Participant Service: GetParticipantData()
    Reporting Service->>ClickHouse: ProcessData()
    ClickHouse-->>Reporting Service: AggregatedData()
    Reporting Service->>ExcelRenderer: CreateXLSX()
    ExcelRenderer-->>AdminUI: DownloadReport()
g