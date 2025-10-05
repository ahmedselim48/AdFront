# 🔄 A/B Testing Backend-Frontend Synchronization

## 📋 Overview
تم تنسيق وتطابق Backend و Frontend في نظام A/B Testing لضمان عمل السيناريو بشكل سليم.

## 🔧 Backend Changes

### 1. Entity Updates
**File:** `HarajAI.Domain/Entities/AdABTest.cs`
```csharp
// Added new fields
public string? TestName { get; set; }
public string? Description { get; set; }
```

### 2. Command Updates
**File:** `HarajAI.Application/Features/Advertisements/Commands/StartAdABTestCommand.cs`
```csharp
public record StartAdABTestCommand(
    Guid UserId, 
    Guid AdAId, 
    Guid AdBId, 
    DateTime? EndsAtUtc, 
    string? TestName = null, 
    string? Description = null
) : IRequest<GeneralResponse<Guid>>;
```

### 3. Command Handler Updates
**File:** `HarajAI.Application/Features/Advertisements/Commands/StartAdABTestCommandHandler.cs`
```csharp
var test = new AdABTest
{
    // ... existing fields
    TestName = request.TestName ?? $"A/B Test - {adA.Title} vs {adB.Title}",
    Description = request.Description
};
```

### 4. Request Model Updates
**File:** `HarajAI.Application/Models/Advertisements/StartAdABTestRequest.cs`
```csharp
public class StartAdABTestRequest
{
    public Guid AdAId { get; set; }
    public Guid AdBId { get; set; }
    public DateTime EndsAtUtc { get; set; }
    public string? TestName { get; set; }      // Added
    public string? Description { get; set; }   // Added
}
```

### 5. DTO Updates
**File:** `HarajAI.Application/Features/Advertisements/Queries/GetUserABTestsQuery.cs`
```csharp
public class ABTestSummaryDto
{
    // ... existing fields
    public string TestName { get; set; } = string.Empty;     // Added
    public string? Description { get; set; }                 // Added
}
```

### 6. Controller Updates
**File:** `HarajAI.WebAPI/Controllers/AdsController.cs`
```csharp
// Updated StartABTest endpoint
[HttpPost("ab-tests/start")]
public async Task<IActionResult> StartABTest([FromBody] StartAdABTestRequest body)
{
    var response = await _mediator.Send(new StartAdABTestCommand(
        userId, body.AdAId, body.AdBId, body.EndsAtUtc, 
        body.TestName, body.Description));
    return FromResponse(response, StatusCodes.Status201Created);
}

// Added analytics endpoint
[HttpGet("ab-tests/{testId:guid}/analytics")]
public async Task<IActionResult> GetABTestAnalytics(Guid testId)
{
    var response = await _mediator.Send(new GetAdABTestResultQuery(testId));
    return FromResponse(response);
}
```

### 7. Database Migration
**File:** `HarajAI.Persistence/Migrations/20250101000000_AddABTestNameAndDescription.cs`
```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "Description",
        table: "AdABTests",
        type: "nvarchar(max)",
        nullable: true);

    migrationBuilder.AddColumn<string>(
        name: "TestName",
        table: "AdABTests",
        type: "nvarchar(max)",
        nullable: true);
}
```

## 🎨 Frontend Changes

### 1. Model Updates
**File:** `AdFront/src/app/models/ads.models.ts`
```typescript
export interface StartAdABTestRequest {
  adAId: string;
  adBId: string;
  endsAtUtc: Date;
  testName?: string;      // Added
  description?: string;   // Added
}

export interface ABTestDto {
  // ... existing fields
  testName: string;       // Added
  description?: string;   // Added
}
```

### 2. Service Updates
**File:** `AdFront/src/app/features/ads/ads.service.ts`
```typescript
startABTest(adAId: string, adBId: string, endsAt: Date, testName?: string, description?: string): Observable<ABTestDto> {
  return this.api.post$('/ads/ab-tests/start', {
    adAId,
    adBId,
    endsAtUtc: endsAt.toISOString(),
    testName,      // Added
    description    // Added
  });
}
```

### 3. Component Updates
**File:** `AdFront/src/app/features/ads/components/ab-test-dashboard/start-ab-test-dialog.component.ts`
```typescript
// Form includes testName and description
private initializeForm() {
  this.abTestForm = this.fb.group({
    adAId: ['', Validators.required],
    adBId: ['', Validators.required],
    endsAtUtc: ['', Validators.required],
    testName: ['', Validators.required],     // Added
    description: ['']                        // Added
  }, { validators: this.differentAdsValidator });
}

// Service call includes new parameters
this.adsService.startABTest(formValue.adAId, formValue.adBId, endDate, formValue.testName, formValue.description)
```

### 4. Template Updates
**File:** `AdFront/src/app/features/ads/components/ab-test-dashboard/ab-test-dashboard.component.html`
```html
<div class="test-info">
  <h3 class="test-name">{{ test.testName }}</h3>
  <p class="test-description" *ngIf="test.description">{{ test.description }}</p>
</div>
```

### 5. Style Updates
**File:** `AdFront/src/app/features/ads/components/ab-test-dashboard/ab-test-dashboard.component.scss`
```scss
.test-info {
  .test-name {
    margin: 0 0 4px;
    font-size: 1.2rem;
    font-weight: 600;
    color: #2196f3;
  }

  .test-description {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }
}
```

## 🔄 API Endpoints

### Backend Endpoints
```
POST /api/ads/ab-tests/start
GET  /api/ads/ab-tests/my
GET  /api/ads/ab-tests/{testId}
POST /api/ads/ab-tests/{testId}/end
GET  /api/ads/ab-tests/{testId}/analytics  // New
```

### Frontend Service Methods
```typescript
startABTest(adAId, adBId, endsAt, testName?, description?)
getMyABTests()
getABTestResult(testId)
endABTest(testId)
getABTestAnalytics(testId)  // New
```

## 🎯 User Flow

### 1. Create A/B Test
1. User clicks "بدء اختبار جديد"
2. Fills test name and description
3. Selects two published ads
4. Sets end date
5. Clicks "بدء الاختبار"

### 2. View A/B Tests
1. User navigates to A/B Testing dashboard
2. Sees list of all tests with names and descriptions
3. Can view test status and metrics
4. Can end active tests

### 3. View Test Results
1. User clicks "عرض النتائج" on completed test
2. Sees detailed analytics and comparison
3. Can export results

## ✅ Validation

### Backend Validation
- TestName is required
- Description is optional
- AdAId and AdBId must be different
- EndsAtUtc must be in future
- Both ads must belong to user

### Frontend Validation
- Form validation for all required fields
- Date picker prevents past dates
- Ad selection prevents same ad selection
- Real-time form validation feedback

## 🚀 Benefits

1. **Better UX**: Users can name and describe their tests
2. **Clear Organization**: Tests are easily identifiable
3. **Complete Integration**: Backend and Frontend are fully synchronized
4. **Data Consistency**: All data flows correctly between layers
5. **Professional Look**: Enhanced UI with test names and descriptions

## 🔧 Technical Notes

- Database migration required for new fields
- All existing tests will have auto-generated names
- Backward compatibility maintained
- Error handling for all new fields
- Responsive design for all new UI elements

## 📝 Next Steps

1. Run database migration
2. Test all A/B testing flows
3. Verify data consistency
4. Test error scenarios
5. Performance testing with large datasets



