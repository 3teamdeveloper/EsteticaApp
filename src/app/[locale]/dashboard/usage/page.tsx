"use client";

import {
  CheckCircle2,
  User,
  Briefcase,
  Clock,
  Users,
  Share2,
  BookOpen,
  LayoutDashboard,
  Calendar,
  BarChart2,
  Eye,
  Settings,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

type StepContent = {
  subtitle: string;
  description?: string;
  example?: string;
  note?: string; // 👈 importante
};

type Step = {
  number: number;
  title: string;
  icon: any;
  color: string;
  gradient: string;
  content: StepContent[];
  stepTip?: string;
  note?: string;
  optional?: boolean;
  important?: string;
};

export default function UsagePage() {
  const t = useTranslations('usage');
  const locale = useLocale();
  
  const steps: Step[] = [
    {
      number: 1,
      title: t('steps.profile.title'),
      icon: User,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      content: [
        {
          subtitle: t('steps.profile.url_subtitle'),
          description: t('steps.profile.url_description'),
          example: t('steps.profile.url_example'),
          note: t('steps.profile.url_note'),
        },
        {
          subtitle: t('steps.profile.title_subtitle'),
          description: t('steps.profile.title_description'),
          example: t('steps.profile.title_example'),
        },
        {
          subtitle: t('steps.profile.bio_subtitle'),
          description: t('steps.profile.bio_description'),
        },
        {
          subtitle: t('steps.profile.images_subtitle'),
          description: t('steps.profile.images_description'),
        },
        {
          subtitle: t('steps.profile.customization_subtitle'),
          description: t('steps.profile.customization_description'),
        },
      ],
      stepTip: t('steps.profile.tip'),
    },
    {
      number: 2,
      title: t('steps.services.title'),
      icon: Briefcase,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      content: [
        {
          subtitle: t('steps.services.name_subtitle'),
          example: t('steps.services.name_example'),
        },
        {
          subtitle: t('steps.services.duration_subtitle'),
          description: t('steps.services.duration_description'),
          example: t('steps.services.duration_example'),
          note: t('steps.services.duration_note'),
        },
        {
          subtitle: t('steps.services.price_subtitle'),
          description: t('steps.services.price_description'),
        },
        {
          subtitle: t('steps.services.description_subtitle'),
          description: t('steps.services.description_description'),
          example: t('steps.services.description_example'),
        },
        {
          subtitle: t('steps.services.photo_subtitle'),
          description: t('steps.services.photo_description'),
        },
      ],
      stepTip: t('steps.services.tip'),
    },
    {
      number: 3,
      title: t('steps.hours.title'),
      icon: Clock,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      content: [
        {
          subtitle: t('steps.hours.days_subtitle'),
          example: t('steps.hours.days_example'),
        },
        {
          subtitle: t('steps.hours.schedule_subtitle'),
          description: t('steps.hours.schedule_description'),
          example: t('steps.hours.schedule_example'),
        },
        {
          subtitle: t('steps.hours.split_subtitle'),
          description: t('steps.hours.split_description'),
          example: t('steps.hours.split_example'),
        },
      ],
      stepTip: t('steps.hours.tip'),
    },
    {
      number: 4,
      title: t('steps.team.title'),
      icon: Users,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
      optional: false,
      content: [
        {
          subtitle: t('steps.team.basic_subtitle'),
          description: t('steps.team.basic_description'),
        },
        {
          subtitle: t('steps.team.assign_subtitle'),
          description: t('steps.team.assign_description'),
          example: t('steps.team.assign_example'),
        },
        {
          subtitle: t('steps.team.schedule_subtitle'),
          description: t('steps.team.schedule_description'),
        },
      ],
      note: t('steps.team.note'),
      important: t('steps.team.important'),
    },
    {
      number: 5,
      title: t('steps.share.title'),
      icon: Share2,
      color: "bg-rose-500",
      gradient: "from-rose-500 to-rose-600",
      content: [
        {
          subtitle: t('steps.share.ready_subtitle'),
          description: t('steps.share.ready_description'),
          example: t('steps.share.ready_example'),
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 p-2 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          {/* <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"> */}
          {/* <BookOpen className="w-6 h-6" /> */}
          {/* </div> */}
          <h1 className="text-3xl font-bold">
            {t('header.title')}
          </h1>
        </div>
        <p className="text-rose-100 text-lg">
          {t('header.description')}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Step Header */}
              <div
                className={`bg-gradient-to-r ${step.gradient} p-4 md:p-6 text-white`}
              >
                {/* Mobile: Stack vertically */}
                <div className="flex flex-col gap-3 md:hidden">
                  <div className="flex flex-col gap-2 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-medium bg-white/20 px-3 py-1 rounded-full">
                        {t('step_label')} {step.number}
                      </span>
                    </div>
                      <h3 className="text-xl font-semibold flex items-center gap-2"><Icon className="w-6 h-6" /> {step.title}</h3>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {/* <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"> */}

                    {/* </div> */}
                    {step.optional && (
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        {t('optional')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop: Horizontal layout */}
                <div className="hidden md:flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2"><Icon className="w-6 h-6" /> {step.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      {t('step_label')} {step.number}
                    </span>
                    {step.optional && (
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        {t('optional')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6 space-y-4">
                {step.content.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${step.color}`}
                      ></span>
                      {item.subtitle}
                    </h4>
                    {item.description && (
                      <p className="text-gray-700 ml-4">{item.description}</p>
                    )}
                    {item.example && (
                      <div className="ml-4 bg-gray-50 border-l-4 border-gray-300 p-3 rounded">
                        <p className="text-sm text-gray-600 italic">
                          {item.example}
                        </p>
                      </div>
                    )}
                    {item.note && (
                      <div className="ml-4 bg-blue-50 border border-blue-400 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">💡 {t('note_label')}</span>{" "}
                          {item.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Step Tip */}
                {step.stepTip && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">💡 {t('tip_label')}</span>{" "}
                      {step.stepTip}
                    </p>
                  </div>
                )}

                {/* Note*/}
                {step.note && (
                  <div className="mt-4 bg-blue-50 border border-blue-400 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">💡 {t('note_label')}</span>{" "}
                      {step.note}
                    </p>
                  </div>
                )}

                {/* Important Note */}
                {step.important && (
                  <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg p-4">
                    <p className="text-sm text-rose-900">
                      <span className="font-semibold">⚠️ {t('important_label')}</span>{" "}
                      {step.important}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mb-12 ">
        <div className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg md:text-xl md:p-10 shadow-lg">
          {t('ready_message')}
        </div>
      </div>

      {/* What clients will see */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ThumbsUp className="w-7 h-7 text-purple-600" />
          {t('client_view.title')}
        </h2>
        <div className="space-y-3 p-6 text-gray-700">
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span>
              {t('client_view.items.profile')}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            {t('client_view.items.choose_service')}
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span>
              {t('client_view.items.select_datetime')}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            {t('client_view.items.complete_data')}
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            {t('client_view.items.confirm')}
          </p>
        </div>
        
        <div className="mt-4 bg-white rounded-lg p-4 border border-purple-200">
          <p className="font-semibold text-gray-900 mb-2">{t('client_view.you_receive')}</p>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('client_view.receive_items.notification')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('client_view.receive_items.client_data')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('client_view.receive_items.agenda')}
            </li>
          </ul>
        </div>

      </div>

      {/* Management Tools */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 md:p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-600" />
          {t('management.title')}
        </h2>
        <p className="text-gray-700 mb-6">
          {t('management.description')}
        </p>

        <div className="space-y-4">
          {/* Dashboard Principal */}
          <div className="bg-white rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  {t('management.dashboard.title')}
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  {t('management.dashboard.description')}
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    {t('management.dashboard.items.services')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    {t('management.dashboard.items.employees')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    {t('management.dashboard.items.appointments')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    {t('management.dashboard.items.quick_access')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agenda de Turnos */}
          <div className="bg-white rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  {t('management.agenda.title')}
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  {t('management.agenda.description')}
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('management.agenda.items.calendar')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('management.agenda.items.filter')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('management.agenda.items.manage')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('management.agenda.items.details')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('management.agenda.items.manual')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  {t('management.stats.title')}
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  {t('management.stats.description')}
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('management.stats.items.revenue')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('management.stats.items.popular')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('management.stats.items.performance')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('management.stats.items.peak_hours')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {t('management.stats.items.reports')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-900">💡 {t('tip_label')}</span> {t('management.tip')}
          </p>
        </div>
      </div>

      {/* Success Tips */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-7 h-7 text-white" />
          {t('success_tips.title')}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: t('success_tips.items.calendar.title'),
              desc: t('success_tips.items.calendar.desc'),
            },
            {
              title: t('success_tips.items.respond.title'),
              desc: t('success_tips.items.respond.desc'),
            },
            {
              title: t('success_tips.items.share.title'),
              desc: t('success_tips.items.share.desc'),
            },
            {
              title: t('success_tips.items.profile.title'),
              desc: t('success_tips.items.profile.desc'),
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
            >
              <h3 className="font-semibold mb-1">{tip.title}</h3>
              <p className="text-sm text-green-100">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
          <HelpCircle className="w-7 h-7 text-rose-600" />
          {t('help.title')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('help.description')}{" "}
          <span className="font-semibold text-rose-600">
            <Link href={`/${locale}/dashboard/settings/support`}>{t('help.support_link')}</Link>
          </span>{" "}
          {t('help.description_end')}
        </p>
      </div>
    </div>
  );
}
