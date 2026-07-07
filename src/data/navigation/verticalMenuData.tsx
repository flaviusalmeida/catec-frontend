// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  // This is how you will normally render submenu
  {
    label: 'dashboards',
    suffix: {
      label: '5',
      color: 'error'
    },
    icon: 'tabler-smart-home',
    children: [
      // This is how you will normally render menu item
      {
        label: 'crm',
        icon: 'tabler-circle',
        href: '/dashboards/crm'
      },
      {
        label: 'analytics',
        icon: 'tabler-circle',
        href: '/dashboards/analytics'
      },
      {
        label: 'eCommerce',
        icon: 'tabler-circle',
        href: '/dashboards/ecommerce'
      },
      {
        label: 'academy',
        icon: 'tabler-circle',
        href: '/dashboards/academy'
      },
      {
        label: 'logistics',
        icon: 'tabler-circle',
        href: '/dashboards/logistics'
      }
    ]
  },
  {
    label: 'frontPages',
    icon: 'tabler-files',
    children: [
      {
        label: 'landing',
        href: '/front-pages/landing-page',
        target: '_blank',
        
      },
      {
        label: 'pricing',
        href: '/front-pages/pricing',
        target: '_blank',
        
      },
      {
        label: 'payment',
        href: '/front-pages/payment',
        target: '_blank',
        
      },
      {
        label: 'checkout',
        href: '/front-pages/checkout',
        target: '_blank',
        
      },
      {
        label: 'helpCenter',
        href: '/front-pages/help-center',
        target: '_blank',
        
      }
    ]
  },

  // This is how you will normally render menu section
  {
    label: 'appsPages',
    isSection: true,
    children: [
      {
        label: 'eCommerce',
        icon: 'tabler-shopping-cart',
        children: [
          {
            label: 'dashboard',
            href: '/apps/ecommerce/dashboard'
          },
          {
            label: 'products',
            children: [
              {
                label: 'list',
                href: '/apps/ecommerce/products/list'
              },
              {
                label: 'add',
                href: '/apps/ecommerce/products/add'
              },
              {
                label: 'category',
                href: '/apps/ecommerce/products/category'
              }
            ]
          },
          {
            label: 'orders',
            children: [
              {
                label: 'list',
                href: '/apps/ecommerce/orders/list'
              },
              {
                label: 'details',
                href: '/apps/ecommerce/orders/details/5434',
                exactMatch: false,
                activeUrl: '/apps/ecommerce/orders/details'
              }
            ]
          },
          {
            label: 'customers',
            children: [
              {
                label: 'list',
                href: '/apps/ecommerce/customers/list'
              },
              {
                label: 'details',
                href: '/apps/ecommerce/customers/details/879861',
                exactMatch: false,
                activeUrl: '/apps/ecommerce/customers/details'
              }
            ]
          },
          {
            label: 'manageReviews',
            href: '/apps/ecommerce/manage-reviews'
          },
          {
            label: 'referrals',
            href: '/apps/ecommerce/referrals'
          },
          {
            label: 'settings',
            href: '/apps/ecommerce/settings'
          }
        ]
      },
      {
        label: 'academy',
        icon: 'tabler-school',
        children: [
          {
            label: 'dashboard',
            href: '/apps/academy/dashboard'
          },
          {
            label: 'myCourses',
            href: '/apps/academy/my-courses'
          },
          {
            label: 'courseDetails',
            href: '/apps/academy/course-details'
          }
        ]
      },
      {
        label: 'logistics',
        icon: 'tabler-truck',
        children: [
          {
            label: 'dashboard',
            href: '/apps/logistics/dashboard'
          },
          {
            label: 'fleet',
            href: '/apps/logistics/fleet'
          }
        ]
      },
      {
        label: 'email',
        icon: 'tabler-mail',
        href: '/apps/email',
        exactMatch: false,
        activeUrl: '/apps/email'
      },
      {
        label: 'chat',
        icon: 'tabler-message-circle-2',
        href: '/apps/chat'
      },
      {
        label: 'calendar',
        icon: 'tabler-calendar',
        href: '/apps/calendar'
      },
      {
        label: 'kanban',
        icon: 'tabler-copy',
        href: '/apps/kanban'
      },
      {
        label: 'invoice',
        icon: 'tabler-file-description',
        children: [
          {
            label: 'list',
            icon: 'tabler-circle',
            href: '/apps/invoice/list'
          },
          {
            label: 'preview',
            icon: 'tabler-circle',
            href: '/apps/invoice/preview/4987',
            exactMatch: false,
            activeUrl: '/apps/invoice/preview'
          },
          {
            label: 'edit',
            icon: 'tabler-circle',
            href: '/apps/invoice/edit/4987',
            exactMatch: false,
            activeUrl: '/apps/invoice/edit'
          },
          {
            label: 'add',
            icon: 'tabler-circle',
            href: '/apps/invoice/add'
          }
        ]
      },
      {
        label: 'user',
        icon: 'tabler-user',
        children: [
          {
            label: 'list',
            icon: 'tabler-circle',
            href: '/apps/user/list'
          },
          {
            label: 'view',
            icon: 'tabler-circle',
            href: '/apps/user/view'
          }
        ]
      },
      {
        label: 'rolesPermissions',
        icon: 'tabler-lock',
        children: [
          {
            label: 'roles',
            icon: 'tabler-circle',
            href: '/apps/roles'
          },
          {
            label: 'permissions',
            icon: 'tabler-circle',
            href: '/apps/permissions'
          }
        ]
      },
      {
        label: 'pages',
        icon: 'tabler-file',
        children: [
          {
            label: 'userProfile',
            icon: 'tabler-circle',
            href: '/pages/user-profile'
          },
          {
            label: 'accountSettings',
            icon: 'tabler-circle',
            href: '/pages/account-settings'
          },
          {
            label: 'faq',
            icon: 'tabler-circle',
            href: '/pages/faq'
          },
          {
            label: 'pricing',
            icon: 'tabler-circle',
            href: '/pages/pricing'
          },
          {
            label: 'miscellaneous',
            icon: 'tabler-circle',
            children: [
              {
                label: 'comingSoon',
                icon: 'tabler-circle',
                href: '/pages/misc/coming-soon',
                target: '_blank'
              },
              {
                label: 'underMaintenance',
                icon: 'tabler-circle',
                href: '/pages/misc/under-maintenance',
                target: '_blank'
              },
              {
                label: 'pageNotFound404',
                icon: 'tabler-circle',
                href: '/pages/misc/404-not-found',
                target: '_blank'
              },
              {
                label: 'notAuthorized401',
                icon: 'tabler-circle',
                href: '/pages/misc/401-not-authorized',
                target: '_blank'
              }
            ]
          }
        ]
      },
      {
        label: 'authPages',
        icon: 'tabler-shield-lock',
        children: [
          {
            label: 'login',
            icon: 'tabler-circle',
            children: [
              {
                label: 'loginV1',
                icon: 'tabler-circle',
                href: '/pages/auth/login-v1',
                target: '_blank'
              },
              {
                label: 'loginV2',
                icon: 'tabler-circle',
                href: '/pages/auth/login-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: 'register',
            icon: 'tabler-circle',
            children: [
              {
                label: 'registerV1',
                icon: 'tabler-circle',
                href: '/pages/auth/register-v1',
                target: '_blank'
              },
              {
                label: 'registerV2',
                icon: 'tabler-circle',
                href: '/pages/auth/register-v2',
                target: '_blank'
              },
              {
                label: 'registerMultiSteps',
                icon: 'tabler-circle',
                href: '/pages/auth/register-multi-steps',
                target: '_blank'
              }
            ]
          },
          {
            label: 'verifyEmail',
            icon: 'tabler-circle',
            children: [
              {
                label: 'verifyEmailV1',
                icon: 'tabler-circle',
                href: '/pages/auth/verify-email-v1',
                target: '_blank'
              },
              {
                label: 'verifyEmailV2',
                icon: 'tabler-circle',
                href: '/pages/auth/verify-email-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: 'forgotPassword',
            icon: 'tabler-circle',
            children: [
              {
                label: 'forgotPasswordV1',
                icon: 'tabler-circle',
                href: '/pages/auth/forgot-password-v1',
                target: '_blank'
              },
              {
                label: 'forgotPasswordV2',
                icon: 'tabler-circle',
                href: '/pages/auth/forgot-password-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: 'resetPassword',
            icon: 'tabler-circle',
            children: [
              {
                label: 'resetPasswordV1',
                icon: 'tabler-circle',
                href: '/pages/auth/reset-password-v1',
                target: '_blank'
              },
              {
                label: 'resetPasswordV2',
                icon: 'tabler-circle',
                href: '/pages/auth/reset-password-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: 'twoSteps',
            icon: 'tabler-circle',
            children: [
              {
                label: 'twoStepsV1',
                icon: 'tabler-circle',
                href: '/pages/auth/two-steps-v1',
                target: '_blank'
              },
              {
                label: 'twoStepsV2',
                icon: 'tabler-circle',
                href: '/pages/auth/two-steps-v2',
                target: '_blank'
              }
            ]
          }
        ]
      },
      {
        label: 'wizardExamples',
        icon: 'tabler-dots',
        children: [
          {
            label: 'checkout',
            icon: 'tabler-circle',
            href: '/pages/wizard-examples/checkout'
          },
          {
            label: 'propertyListing',
            icon: 'tabler-circle',
            href: '/pages/wizard-examples/property-listing'
          },
          {
            label: 'createDeal',
            icon: 'tabler-circle',
            href: '/pages/wizard-examples/create-deal'
          }
        ]
      },
      {
        label: 'dialogExamples',
        icon: 'tabler-square',
        href: '/pages/dialog-examples'
      },
      {
        label: 'widgetExamples',
        icon: 'tabler-chart-bar',
        children: [
          {
            label: 'basic',
            href: '/pages/widget-examples/basic'
          },
          {
            label: 'advanced',
            icon: 'tabler-circle',
            href: '/pages/widget-examples/advanced'
          },
          {
            label: 'statistics',
            icon: 'tabler-circle',
            href: '/pages/widget-examples/statistics'
          },
          {
            label: 'charts',
            icon: 'tabler-circle',
            href: '/pages/widget-examples/charts'
          },
          {
            label: 'actions',
            href: '/pages/widget-examples/actions'
          }
        ]
      }
    ]
  },
  {
    label: 'formsAndTables',
    isSection: true,
    children: [
      {
        label: 'formLayouts',
        icon: 'tabler-layout',
        href: '/forms/form-layouts'
      },
      {
        label: 'formValidation',
        icon: 'tabler-checkup-list',
        href: '/forms/form-validation'
      },
      {
        label: 'formWizard',
        icon: 'tabler-git-merge',
        href: '/forms/form-wizard'
      },
      {
        label: 'reactTable',
        icon: 'tabler-table',
        href: '/react-table'
      },
      {
        label: 'formELements',
        icon: 'tabler-checkbox',
        suffix: <i className='tabler-external-link text-xl' />,
        href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`,
        target: '_blank'
      },
      {
        label: 'muiTables',
        icon: 'tabler-layout-board-split',
        href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`,
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank'
      }
    ]
  },
  {
    label: 'chartsMisc',
    isSection: true,
    children: [
      {
        label: 'charts',
        icon: 'tabler-chart-donut-2',
        children: [
          {
            label: 'apex',
            icon: 'tabler-circle',
            href: '/charts/apex-charts'
          },
          {
            label: 'recharts',
            icon: 'tabler-circle',
            href: '/charts/recharts'
          }
        ]
      },

      {
        label: 'foundation',
        icon: 'tabler-cards',
        href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/foundation`,
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank'
      },
      {
        label: 'components',
        icon: 'tabler-atom',
        href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`,
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank'
      },
      {
        label: 'menuExamples',
        icon: 'tabler-list-search',
        href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`,
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank'
      },
      {
        label: 'raiseSupport',
        icon: 'tabler-lifebuoy',
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank',
        href: 'https://pixinvent.ticksy.com'
      },
      {
        label: 'documentation',
        icon: 'tabler-book-2',
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank',
        href: `${process.env.NEXT_PUBLIC_DOCS_URL}`
      },
      {
        label: 'others',
        icon: 'tabler-menu-2',
        children: [
          {
            suffix: {
              label: 'New',
              color: 'info'
            },
            label: 'itemWithBadge',
            icon: 'tabler-circle'
          },
          {
            label: 'externalLink',
            icon: 'tabler-circle',
            href: 'https://pixinvent.com',
            target: '_blank',
            suffix: <i className='tabler-external-link text-xl' />
          },
          {
            label: 'menuLevels',
            icon: 'tabler-circle',
            children: [
              {
                label: 'menuLevel2',
                icon: 'tabler-circle'
              },
              {
                label: 'menuLevel2',
                icon: 'tabler-circle',
                children: [
                  {
                    label: 'menuLevel3',
                    icon: 'tabler-circle'
                  },
                  {
                    label: 'menuLevel3',
                    icon: 'tabler-circle'
                  }
                ]
              }
            ]
          },
          {
            label: 'disabledMenu',
            disabled: true
          }
        ]
      }
    ]
  }
]

export default verticalMenuData
