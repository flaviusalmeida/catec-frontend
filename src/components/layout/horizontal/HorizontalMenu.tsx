// Next Imports

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import CatecNavMenuItems from '@/components/catec/CatecNavMenuItems'
import VerticalNavContent from './VerticalNavContent'
import CustomChip from '@core/components/mui/Chip'

// import { GenerateHorizontalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/horizontalMenuData'

// Config Imports
import { SHOW_VUEXY_DEMOS } from '@configs/featureFlags'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='tabler-chevron-right' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = () => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  

  // Vars
  const { transitionDuration } = verticalNavOptions
  

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-paper)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        {SHOW_VUEXY_DEMOS ? (
          <>
            <SubMenu label='dashboards' icon={<i className='tabler-smart-home' />}>
          <MenuItem href='/dashboards/crm' icon={<i className='tabler-chart-pie-2' />}>
            crm
          </MenuItem>
          <MenuItem href='/dashboards/analytics' icon={<i className='tabler-trending-up' />}>
            analytics
          </MenuItem>
          <MenuItem href='/dashboards/ecommerce' icon={<i className='tabler-shopping-cart' />}>
            eCommerce
          </MenuItem>
          <MenuItem href='/dashboards/academy' icon={<i className='tabler-school' />}>
            academy
          </MenuItem>
          <MenuItem href='/dashboards/logistics' icon={<i className='tabler-truck' />}>
            logistics
          </MenuItem>
        </SubMenu>
        <SubMenu label='catec' icon={<i className='tabler-building' />}>
          <CatecNavMenuItems  withIcons />
        </SubMenu>
        <SubMenu label='apps' icon={<i className='tabler-mail' />}>
          <SubMenu label='eCommerce' icon={<i className='tabler-shopping-cart' />}>
            <MenuItem href='/apps/ecommerce/dashboard'>dashboard</MenuItem>
            <SubMenu label='products'>
              <MenuItem href='/apps/ecommerce/products/list'>list</MenuItem>
              <MenuItem href='/apps/ecommerce/products/add'>add</MenuItem>
              <MenuItem href='/apps/ecommerce/products/category'>
                category
              </MenuItem>
            </SubMenu>
            <SubMenu label='orders'>
              <MenuItem href='/apps/ecommerce/orders/list'>list</MenuItem>
              <MenuItem
                href='/apps/ecommerce/orders/details/5434'
                exactMatch={false}
                activeUrl='/apps/ecommerce/orders/details'
              >
                details
              </MenuItem>
            </SubMenu>
            <SubMenu label='customers'>
              <MenuItem href='/apps/ecommerce/customers/list'>list</MenuItem>
              <MenuItem
                href='/apps/ecommerce/customers/details/879861'
                exactMatch={false}
                activeUrl='/apps/ecommerce/customers/details'
              >
                details
              </MenuItem>
            </SubMenu>
            <MenuItem href='/apps/ecommerce/manage-reviews'>
              manageReviews
            </MenuItem>
            <MenuItem href='/apps/ecommerce/referrals'>referrals</MenuItem>
            <MenuItem href='/apps/ecommerce/settings'>settings</MenuItem>
          </SubMenu>
          <SubMenu label='academy' icon={<i className='tabler-school' />}>
            <MenuItem href='/apps/academy/dashboard'>dashboard</MenuItem>
            <MenuItem href='/apps/academy/my-courses'>myCourses</MenuItem>
            <MenuItem href='/apps/academy/course-details'>
              courseDetails
            </MenuItem>
          </SubMenu>
          <SubMenu label='logistics' icon={<i className='tabler-truck' />}>
            <MenuItem href='/apps/logistics/dashboard'>dashboard</MenuItem>
            <MenuItem href='/apps/logistics/fleet'>fleet</MenuItem>
          </SubMenu>
          <MenuItem
            href='/apps/email'
            icon={<i className='tabler-mail' />}
            exactMatch={false}
            activeUrl='/apps/email'
          >
            email
          </MenuItem>
          <MenuItem href='/apps/chat' icon={<i className='tabler-message-circle-2' />}>
            chat
          </MenuItem>
          <MenuItem href='/apps/calendar' icon={<i className='tabler-calendar' />}>
            calendar
          </MenuItem>
          <MenuItem href='/apps/kanban' icon={<i className='tabler-copy' />}>
            kanban
          </MenuItem>
          <SubMenu label='invoice' icon={<i className='tabler-file-description' />}>
            <MenuItem href='/apps/invoice/list'>list</MenuItem>
            <MenuItem
              href='/apps/invoice/preview/4987'
              exactMatch={false}
              activeUrl='/apps/invoice/preview'
            >
              preview
            </MenuItem>
            <MenuItem href='/apps/invoice/edit/4987' exactMatch={false} activeUrl='/apps/invoice/edit'>
              edit
            </MenuItem>
            <MenuItem href='/apps/invoice/add'>add</MenuItem>
          </SubMenu>
          <SubMenu label='user' icon={<i className='tabler-user' />}>
            <MenuItem href='/apps/user/list'>list</MenuItem>
            <MenuItem href='/apps/user/view'>view</MenuItem>
          </SubMenu>
          <SubMenu label='rolesPermissions' icon={<i className='tabler-lock' />}>
            <MenuItem href='/apps/roles'>roles</MenuItem>
            <MenuItem href='/apps/permissions'>permissions</MenuItem>
          </SubMenu>
        </SubMenu>
        <SubMenu label='pages' icon={<i className='tabler-file' />}>
          <MenuItem href='/pages/user-profile' icon={<i className='tabler-user-circle' />}>
            userProfile
          </MenuItem>
          <MenuItem href='/pages/account-settings' icon={<i className='tabler-settings' />}>
            accountSettings
          </MenuItem>
          <MenuItem href='/pages/faq' icon={<i className='tabler-help-circle' />}>
            faq
          </MenuItem>
          <MenuItem href='/pages/pricing' icon={<i className='tabler-currency-dollar' />}>
            pricing
          </MenuItem>
          <SubMenu label='miscellaneous' icon={<i className='tabler-file-info' />}>
            <MenuItem href='/pages/misc/coming-soon' target='_blank'>
              comingSoon
            </MenuItem>
            <MenuItem href='/pages/misc/under-maintenance' target='_blank'>
              underMaintenance
            </MenuItem>
            <MenuItem href='/pages/misc/404-not-found' target='_blank'>
              pageNotFound404
            </MenuItem>
            <MenuItem href='/pages/misc/401-not-authorized' target='_blank'>
              notAuthorized401
            </MenuItem>
          </SubMenu>
          <SubMenu label='authPages' icon={<i className='tabler-shield-lock' />}>
            <SubMenu label='login'>
              <MenuItem href='/pages/auth/login-v1' target='_blank'>
                loginV1
              </MenuItem>
              <MenuItem href='/pages/auth/login-v2' target='_blank'>
                loginV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='register'>
              <MenuItem href='/pages/auth/register-v1' target='_blank'>
                registerV1
              </MenuItem>
              <MenuItem href='/pages/auth/register-v2' target='_blank'>
                registerV2
              </MenuItem>
              <MenuItem href='/pages/auth/register-multi-steps' target='_blank'>
                registerMultiSteps
              </MenuItem>
            </SubMenu>
            <SubMenu label='verifyEmail'>
              <MenuItem href='/pages/auth/verify-email-v1' target='_blank'>
                verifyEmailV1
              </MenuItem>
              <MenuItem href='/pages/auth/verify-email-v2' target='_blank'>
                verifyEmailV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='forgotPassword'>
              <MenuItem href='/pages/auth/forgot-password-v1' target='_blank'>
                forgotPasswordV1
              </MenuItem>
              <MenuItem href='/pages/auth/forgot-password-v2' target='_blank'>
                forgotPasswordV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='resetPassword'>
              <MenuItem href='/pages/auth/reset-password-v1' target='_blank'>
                resetPasswordV1
              </MenuItem>
              <MenuItem href='/pages/auth/reset-password-v2' target='_blank'>
                resetPasswordV2
              </MenuItem>
            </SubMenu>
            <SubMenu label='twoSteps'>
              <MenuItem href='/pages/auth/two-steps-v1' target='_blank'>
                twoStepsV1
              </MenuItem>
              <MenuItem href='/pages/auth/two-steps-v2' target='_blank'>
                twoStepsV2
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label='wizardExamples' icon={<i className='tabler-dots' />}>
            <MenuItem href='/pages/wizard-examples/checkout'>checkout</MenuItem>
            <MenuItem href='/pages/wizard-examples/property-listing'>
              propertyListing
            </MenuItem>
            <MenuItem href='/pages/wizard-examples/create-deal'>
              createDeal
            </MenuItem>
          </SubMenu>
          <MenuItem href='/pages/dialog-examples' icon={<i className='tabler-square' />}>
            dialogExamples
          </MenuItem>
          <SubMenu label='widgetExamples' icon={<i className='tabler-chart-bar' />}>
            <MenuItem href='/pages/widget-examples/basic'>basic</MenuItem>
            <MenuItem href='/pages/widget-examples/advanced'>advanced</MenuItem>
            <MenuItem href='/pages/widget-examples/statistics'>
              statistics
            </MenuItem>
            <MenuItem href='/pages/widget-examples/charts'>charts</MenuItem>
            <MenuItem href='/pages/widget-examples/actions'>actions</MenuItem>
          </SubMenu>
          <SubMenu label='frontPages' icon={<i className='tabler-files' />}>
            <MenuItem href='/front-pages/landing-page' target='_blank'>
              landing
            </MenuItem>
            <MenuItem href='/front-pages/pricing' target='_blank'>
              pricing
            </MenuItem>
            <MenuItem href='/front-pages/payment' target='_blank'>
              payment
            </MenuItem>
            <MenuItem href='/front-pages/checkout' target='_blank'>
              checkout
            </MenuItem>
            <MenuItem href='/front-pages/help-center' target='_blank'>
              helpCenter
            </MenuItem>
          </SubMenu>
        </SubMenu>
        <SubMenu label='formsAndTables' icon={<i className='tabler-file-invoice' />}>
          <MenuItem href='/forms/form-layouts' icon={<i className='tabler-layout' />}>
            formLayouts
          </MenuItem>
          <MenuItem href='/forms/form-validation' icon={<i className='tabler-checkup-list' />}>
            formValidation
          </MenuItem>
          <MenuItem href='/forms/form-wizard' icon={<i className='tabler-git-merge' />}>
            formWizard
          </MenuItem>
          <MenuItem href='/react-table' icon={<i className='tabler-table' />}>
            reactTable
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-checkbox' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            formELements
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-layout-board-split' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            muiTables
          </MenuItem>
        </SubMenu>
        <SubMenu label='charts' icon={<i className='tabler-chart-donut-2' />}>
          <MenuItem href='/charts/apex-charts' icon={<i className='tabler-chart-ppf' />}>
            apex
          </MenuItem>
          <MenuItem href='/charts/recharts' icon={<i className='tabler-chart-sankey' />}>
            recharts
          </MenuItem>
        </SubMenu>
        <SubMenu label='others' icon={<i className='tabler-dots' />}>
          <MenuItem
            icon={<i className='tabler-cards' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/foundation`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            foundation
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-atom' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            components
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-list-search' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`}
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
          >
            menuExamples
          </MenuItem>
          <MenuItem
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
            href='https://pixinvent.ticksy.com'
            icon={<i className='tabler-lifebuoy' />}
          >
            raiseSupport
          </MenuItem>
          <MenuItem
            suffix={<i className='tabler-external-link text-xl' />}
            target='_blank'
            icon={<i className='tabler-book-2' />}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}`}
          >
            documentation
          </MenuItem>
          <MenuItem
            suffix={<CustomChip label='New' size='small' color='info' round='true' />}
            icon={<i className='tabler-notification' />}
          >
            itemWithBadge
          </MenuItem>
          <MenuItem
            icon={<i className='tabler-link' />}
            href='https://pixinvent.com'
            target='_blank'
            suffix={<i className='tabler-external-link text-xl' />}
          >
            externalLink
          </MenuItem>
          <SubMenu label='menuLevels' icon={<i className='tabler-menu-2' />}>
            <MenuItem>menuLevel2</MenuItem>
            <SubMenu label='menuLevel2'>
              <MenuItem>menuLevel3</MenuItem>
              <MenuItem>menuLevel3</MenuItem>
            </SubMenu>
          </SubMenu>
          <MenuItem disabled>disabledMenu</MenuItem>
        </SubMenu>
          </>
        ) : (
          <CatecNavMenuItems  withIcons />
        )}
      </Menu>
      {/* <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        <GenerateHorizontalMenu menuData={menuData(dictionary)} />
      </Menu> */}
    </HorizontalNav>
  )
}

export default HorizontalMenu
