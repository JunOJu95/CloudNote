# Clean Architecture Rules for Ecommerce Vibecoding

## 1. 핵심 원칙 (Core Principles)
- **의존성 규칙 (Dependency Rule)**: 모든 의존성은 항상 바깥쪽(인프라스트럭처/프레임워크)에서 안쪽(도메인/애플리케이션)으로 향해야 합니다. 안쪽 레이어는 바깥쪽 레이어에 대해 아무것도 알아서는 안 됩니다.
- **관심사 분리 (Separation of Concerns)**: 핵심 비즈니스 로직과 프레임워크(Next.js), 서드파티 서비스(Supabase), UI 로직을 철저히 분리합니다.

## 2. 레이어 정의 (Layer Definitions)

### Domain Layer (`domain/`)
- **역할**: 캡슐화된 핵심 비즈니스 규칙과 도메인 모델(Entity)이 위치합니다.
- **제약사항**: 어떤 외부 라이브러리(Next.js, Supabase, React)에도 의존하지 않는 순수한 TypeScript 코드로 작성되어야 합니다.

### Application Layer (`application/`)
- **역할**: 애플리케이션의 유즈케이스(비즈니스 흐름)를 조율합니다.
- **요소**:
  - `use-cases/`: 사용자의 실제 요청 흐름을 처리합니다. (예: `PlaceOrderUseCase`, `AddToCartUseCase`)
  - `ports/`: 바깥쪽 레이어(Infrastructure)가 구현해야 할 인터페이스(`Repository` 등)를 정의합니다. 이를 통해 의존성을 역전시킵니다.

### Infrastructure Layer (`infrastructure/`)
- **역할**: 외부에 대한 구체적인 기술 제어를 담당합니다.
- **요소**:
  - `repositories/`: Application Layer의 `ports/` 에 정의된 인터페이스를 실제 기술(Supabase 등)을 사용해 구현합니다.
  - `services/`: 이메일 발송, PG사 결제 연동 등 외부 API 연동 코드.
  - 외부 기술이 변경되더라도 Application/Domain 계층은 영향받지 않고 이곳만 변경하면 됩니다.

### Presentation / Framework Layer (`presentation/`, `app/`)
- **역할**: 사용자에게 정보를 보여주고 입력을 받거나, 외부 클라이언트 요청을 받는 역할입니다.
- **요소**:
  - `app/`: Next.js 라우팅 진입점 및 컨트롤러 역할 (Server Components, Server Actions, Route Handlers).
  - `presentation/`: 재사용 가능한 UI 컴포넌트, 클라이언트 상태 관리 커스텀 훅 등.

---

## 3. 프로젝트 폴더 구조 (Feature-Sliced 클린 아키텍처)
이커머스 프로젝트 특성상 도메인별(회원, 상품, 주문, 결제 등)로 기능이 많고 복잡해질 가능성이 큽니다. 따라서 전체를 하나의 클린 아키텍처 폴더로 묶기보다는, **비즈니스 도메인(Feature)별로 나누고 그 안에서 클린 아키텍처 계층을 분리하는 방식**을 권장합니다.

```text
ecommerce_vibecoding/
├── app/                        # [Framework] Next.js App Router (UI 진입점 및 컨트롤러)
│   ├── (shop)/page.tsx         # 페이지 렌더링 (UseCase 호출 후 Presentation UI로 데이터 전달)
│   └── api/                    # API 엔드포인트
│
└── src/                        # [Core] 비즈니스 로직 및 프론트엔드 코드
    │
    ├── shared/                 # 공통 모듈 (모든 Feature에서 공유)
    │   ├── ui/                 # 공통 UI 컴포넌트 (버튼, 인풋, 모달 등)
    │   ├── lib/                # 공통 유틸리티 (포매터 등)
    │   └── config/             # 환경 변수, 전역 설정, 공통 타입
    │
    └── features/               # 기능 캡슐화 (비즈니스 도메인별 폴더)
        │
        ├── auth/               # 기능: 인증/회원
        │   ├── domain/         # User 엔티티 등
        │   ├── application/    # Login 유즈케이스, IAuthRepository(Port) 등
        │   ├── infrastructure/ # SupabaseAuthRepository (구현체)
        │   └── presentation/   # LoginForm (인증 도메인 특화 UI 컴포넌트)
        │
        ├── products/           # 기능: 상품 전시 및 검색
        │   ├── domain/         # Product 엔티티, 평가 모델 등
        │   ├── application/    # GetProductListUseCase 등
        │   ├── infrastructure/ # SupabaseProductRepository 등
        │   └── presentation/   # ProductCard, ProductList 컴포넌트 등
        │
        └── orders/             # 기능: 주문 및 장바구니
            ├── domain/         
            ├── application/    
            ├── infrastructure/ 
            └── presentation/   
```

## 4. 코딩 가이드라인 밎 제약 사항
1. **`app` 라우터의 역할 제한 (Controller)**: `app/` 라우터 파일(`page.tsx`, `actions.ts`)들은 클라이언트의 요청을 받아 `src/features/.../application/use-cases`를 호출하고, 그 결과 데이터를 UI 컴포넌트로 전달하는 역할만 수행합니다. 직접적인 DB 쿼리나 비즈니스/검증 로직이 `app/` 폴더 내에 들어가서는 안 됩니다.
2. **인터페이스 기반 의존성 주입**: 유즈케이스는 구체적인 DB 엑세스 클래스가 아닌 인터페이스(`ports/` 하위 타입)에 의존해야 합니다. Next.js 서버 환경에서 유즈케이스를 호출할 때 구체적인 인스턴스(예: SupabaseRepository)를 생성하여 주입(의존성 주입)합니다.
3. **Cross-Feature 룰**: 특정 Feature가 다른 Feature를 참조해야 할 경우, 직접적인 DB나 Infra 계층 참조를 피하고 가급적 Application 계층(UseCase)이나 Shared 계층을 통해 소통해야 결합도를 낮출 수 있습니다.
