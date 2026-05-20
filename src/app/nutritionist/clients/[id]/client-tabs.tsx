"use client";

import { useState } from "react";
import {
  Activity, ClipboardList, CalendarDays, CreditCard, History,
  TrendingUp, ChevronDown, ChevronUp, Trash2,
} from "lucide-react";

interface TabProps {
  client: any;
  progress: any[];
  mealPlans: any[];
  appointments: any[];
  payments: any[];
  t: any;
}

export function ClientTabs({ client, progress, mealPlans, appointments, payments, t }: TabProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: t.overview, icon: Activity },
    { id: "progress", label: t.progress, icon: TrendingUp },
    { id: "mealPlans", label: t.mealPlans, icon: ClipboardList },
    { id: "appointments", label: t.appointments, icon: CalendarDays },
    { id: "payments", label: t.payments, icon: CreditCard },
  ];

  const activePlan = mealPlans.find((mp: any) => mp.client_id === client.id);
  const lastAppointment = appointments.find((a: any) => a.status !== "cancelled");
  const latestProgress = progress[0];

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Info card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold">{t.overview}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">{t.goal}</span>
                <span className="font-medium">{client.goal || "No definido"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">{t.age}</span>
                <span className="font-medium">{client.age ? `${client.age} ${t.ageYears}` : "No registrada"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Peso</span>
                <span className="font-medium">{client.weight ? `${client.weight} kg` : "No registrado"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Altura</span>
                <span className="font-medium">{client.height ? `${client.height} cm` : "No registrada"}</span>
              </div>
              {client.activity_level && (
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Actividad</span>
                  <span className="font-medium capitalize">{client.activity_level}</span>
                </div>
              )}
              {client.sex && (
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Sexo</span>
                  <span className="font-medium capitalize">{client.sex === "male" ? "Masculino" : client.sex === "female" ? "Femenino" : client.sex}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold">{t.measurements}</h3>
              {latestProgress ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso</span>
                    <span className="font-medium">{latestProgress.weight ? `${latestProgress.weight} kg` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grasa corporal</span>
                    <span className="font-medium">{latestProgress.body_fat ? `${latestProgress.body_fat}%` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cintura</span>
                    <span className="font-medium">{latestProgress.waist ? `${latestProgress.waist} cm` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pecho</span>
                    <span className="font-medium">{latestProgress.chest ? `${latestProgress.chest} cm` : "—"}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Registrado: {new Date(latestProgress.recorded_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noNotes}</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold">{t.activeMealPlan}</h3>
              {activePlan ? (
                <div>
                  <p className="text-sm font-medium">{activePlan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activePlan.daily_calories ? `${activePlan.daily_calories} kcal/dia` : "Sin calorias definidas"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin plan activo</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold">{t.lastAppointment}</h3>
              {lastAppointment ? (
                <div>
                  <p className="text-sm font-medium">{lastAppointment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(lastAppointment.date).toLocaleDateString("es-MX")} — {lastAppointment.status}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin citas previas</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "progress" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">{t.evolution}</h3>
          {progress.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noNotes}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">{t.date}</th>
                    <th className="pb-2 font-medium">Peso</th>
                    <th className="pb-2 font-medium">Grasa</th>
                    <th className="pb-2 font-medium">Cintura</th>
                    <th className="pb-2 font-medium">Pecho</th>
                    <th className="pb-2 font-medium">Cadera</th>
                    <th className="pb-2 font-medium">Brazo</th>
                    <th className="pb-2 font-medium">Pierna</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((entry: any) => (
                    <tr key={entry.id} className="border-b border-border/50">
                      <td className="py-2.5 text-muted-foreground">
                        {new Date(entry.recorded_at).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-2.5 font-medium">{entry.weight ?? "—"}</td>
                      <td className="py-2.5">{entry.body_fat ? `${entry.body_fat}%` : "—"}</td>
                      <td className="py-2.5">{entry.waist ?? "—"}</td>
                      <td className="py-2.5">{entry.chest ?? "—"}</td>
                      <td className="py-2.5">{entry.hips ?? "—"}</td>
                      <td className="py-2.5">{entry.arm ?? "—"}</td>
                      <td className="py-2.5">{entry.thigh ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "mealPlans" && (
        <div className="space-y-4">
          {mealPlans.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Sin planes asignados
            </div>
          ) : (
            mealPlans.map((plan: any) => (
              <div key={plan.id} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                    )}
                  </div>
                  {plan.daily_calories && (
                    <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
                      {plan.daily_calories} kcal/dia
                    </div>
                  )}
                </div>

                {plan.meals && plan.meals.length > 0 && (
                  <div className="space-y-2">
                    {plan.meals.map((meal: any) => (
                      <div key={meal.id} className="flex items-center justify-between rounded-lg bg-background px-4 py-2.5 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                            {meal.meal_type}
                          </span>
                          <span>{meal.name}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          {meal.calories && <span>{meal.calories} kcal</span>}
                          {meal.protein && <span>P: {meal.protein}g</span>}
                          {meal.carbs && <span>C: {meal.carbs}g</span>}
                          {meal.fat && <span>G: {meal.fat}g</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="rounded-xl border border-border bg-card p-6">
          {appointments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">Sin citas registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">{t.date}</th>
                    <th className="pb-3 font-medium">Titulo</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt: any) => (
                    <tr key={apt.id} className="border-b border-border/50">
                      <td className="py-3 text-muted-foreground">
                        {new Date(apt.date).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-3 font-medium">{apt.title}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          apt.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : apt.status === "cancelled"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {apt.status === "completed" ? "Completada" : apt.status === "cancelled" ? "Cancelada" : "Programada"}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground capitalize">{apt.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="rounded-xl border border-border bg-card p-6">
          {payments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">Sin pagos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Monto</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Descripcion</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 text-muted-foreground">
                        {p.payment_date
                          ? new Date(p.payment_date).toLocaleDateString("es-MX")
                          : p.created_at
                          ? new Date(p.created_at).toLocaleDateString("es-MX")
                          : "—"}
                      </td>
                      <td className="py-3 font-medium">${Number(p.amount).toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : p.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {p.status === "completed" ? "Pagado" : p.status === "pending" ? "Pendiente" : p.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{p.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}