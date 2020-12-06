import React from 'react'
import { Link as gLink } from 'gatsby'
import rehypeReact from 'rehype-react'
import { Link } from '@material-ui/core'

export function SmartLink(props: rehypeReact.ComponentProps): JSX.Element {
    let href = props.href
        ? // @ts-ignore
          props.children?.[0] === 'Home'
            ? '/'
            : String(props.href).replace(/\.md$/g, '')
        : void 0
    if (href?.startsWith('.') || href?.startsWith('/')) {
        if (href.startsWith('.')) href = '.' + href
        return <Link component={gLink} {...props} to={href} color="textPrimary" underline="always" />
    } else return <Link {...props} href={href} color="textPrimary" underline="always" />
}
