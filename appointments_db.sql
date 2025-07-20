-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	email varchar NOT NULL,
	"fullName" varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" public."users_role_enum" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id),
	CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email)
);


-- public.appointments definition

-- Drop table

-- DROP TABLE public.appointments;

CREATE TABLE public.appointments (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	status public."appointments_status_enum" DEFAULT 'PENDING_PAYMENT'::appointments_status_enum NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"patientId" uuid NULL,
	"doctorId" uuid NULL,
	CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY (id),
	CONSTRAINT "FK_0c1af27b469cb8dca420c160d65" FOREIGN KEY ("doctorId") REFERENCES public.users(id),
	CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES public.users(id)
);


-- public.payments definition

-- Drop table

-- DROP TABLE public.payments;

CREATE TABLE public.payments (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	amount int4 NOT NULL,
	"paymentGatewayId" varchar NOT NULL,
	status public."payments_status_enum" DEFAULT 'FAILED'::payments_status_enum NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"appointmentId" uuid NULL,
	CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id),
	CONSTRAINT "REL_90213a20c94916e46cd2131364" UNIQUE ("appointmentId"),
	CONSTRAINT "UQ_c4f64777cafdc3da201c7b0cd29" UNIQUE ("paymentGatewayId"),
	CONSTRAINT "FK_90213a20c94916e46cd2131364f" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id)
);