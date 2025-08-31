import SignupForm from "@/features/auth/components/SignupForm";

export default function SignUpPage() {
  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex items-center justify-between">
        <h1 className="text-4xl">新規登録</h1>
      </header>

      <main className="col-start-2">
        <div className="mx-auto max-w-md">
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
