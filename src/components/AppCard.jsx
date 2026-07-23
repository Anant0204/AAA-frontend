import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { motion } from 'motion/react';

export const AppCard = ({
  title,
  subheader,
  action,
  actions,
  children,
  noPadding = false,
  hoverable = false,
  sx = {},
}) => {
  const CardComponent = hoverable ? motion(Card) : Card;
  const hoverProps = hoverable
    ? {
      whileHover: { y: -4, boxShadow: '0px 10px 15px -3px rgba(15, 23, 42, 0.08), 0px 4px 6px -4px rgba(15, 23, 42, 0.08)' },
      transition: { duration: 0.2 },
    }
    : {};

  return (
    <CardComponent
      {...hoverProps}
      className="flex flex-col h-full relative overflow-visible border border-solid border-divider shadow-none rounded-[8px]"
      sx={{
        ...sx,
      }}
    >
      {(title || subheader || action) && (
        <>
          <CardHeader
            title={
              typeof title === 'string' ? (
                <Typography variant="h5" className="font-semibold text-h5 text-primary">
                  {title}
                </Typography>
              ) : (
                title
              )
            }
            subheader={subheader}
            action={action}
            className="px-3 pt-2 pb-1.5"
          />
          <Divider />
        </>
      )}
      <CardContent
        className={`flex-grow flex flex-col min-w-0 overflow-hidden ${noPadding ? 'p-0!' : 'p-2! pb-4!'}`}
      >
        {children}
      </CardContent>
      {actions && (
        <>
          <Divider />
          <CardActions className="px-3 py-1.5 flex justify-end">
            {actions}
          </CardActions>
        </>
      )}
    </CardComponent>
  );
};

export default AppCard;
